const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const cwd = __dirname;
const port = Number(process.env.PORT || loadDotEnv(path.join(cwd, ".env")).PORT || 3000);
const env = { ...loadDotEnv(path.join(cwd, ".env")), ...process.env };

const REGION_API_MAP = {
  seoul: { wideCode: "1100000000", airkoreaName: "서울", name: "서울" },
  incheon: { wideCode: "2800000000", airkoreaName: "인천", name: "인천" },
  gyeonggi: { wideCode: "4100000000", airkoreaName: "경기", name: "경기" },
  gangwon: { wideCode: "5100000000", airkoreaName: "강원", name: "강원" },
  sejong: { wideCode: "3600000000", airkoreaName: "세종", name: "세종" },
  chungnam: { wideCode: "4400000000", airkoreaName: "충남", name: "충남" },
  daejeon: { wideCode: "3000000000", airkoreaName: "대전", name: "대전" },
  chungbuk: { wideCode: "4300000000", airkoreaName: "충북", name: "충북" },
  gwangju: { wideCode: "2900000000", airkoreaName: "광주", name: "광주" },
  jeonbuk: { wideCode: "5200000000", airkoreaName: "전북", name: "전북" },
  jeonnam: { wideCode: "4600000000", airkoreaName: "전남", name: "전남" },
  daegu: { wideCode: "2700000000", airkoreaName: "대구", name: "대구" },
  gyeongbuk: { wideCode: "4700000000", airkoreaName: "경북", name: "경북" },
  ulsan: { wideCode: "3100000000", airkoreaName: "울산", name: "울산" },
  busan: { wideCode: "2600000000", airkoreaName: "부산", name: "부산" },
  gyeongnam: { wideCode: "4800000000", airkoreaName: "경남", name: "경남" },
  jeju: { wideCode: "5000000000", airkoreaName: "제주", name: "제주" },
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const cache = new Map();
const AIRKOREA_REFRESH_MS = 15 * 60 * 1000;
const AIRKOREA_REQUEST_DELAY_MS = 1250;
const AIRKOREA_RETRY_DELAY_MS = 2200;
const AIRKOREA_MAX_ATTEMPTS = 3;
let airRealtimeSnapshot = {
  updatedAt: null,
  expiresAt: 0,
  regions: {},
};
let airRefreshPromise = null;

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return acc;
      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) return acc;
      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(text);
}

function serveStatic(res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const normalizedPath = path.normalize(safePath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(cwd, normalizedPath);

  if (!filePath.startsWith(cwd)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendText(res, 404, "Not Found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
  });
  fs.createReadStream(filePath).pipe(res);
}

async function getCached(key, ttlMs, loader) {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = await loader();
  cache.set(key, {
    value,
    expiresAt: now + ttlMs,
  });
  return value;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function parseNumber(value) {
  if (value === null || value === undefined) return null;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function toDashboardLevelFromPollen(rawValue, isAvailable) {
  if (!isAvailable) return null;
  const parsed = parseNumber(rawValue);
  if (parsed === null) return null;
  return Math.max(1, Math.min(4, parsed + 1));
}

function toAirLevelFromPm10(value) {
  if (value === null) return null;
  if (value < 50) return 1;
  if (value <= 80) return 2;
  if (value <= 150) return 3;
  return 4;
}

function toAirLevelFromPm25(value) {
  if (value === null) return null;
  if (value <= 15) return 1;
  if (value <= 35) return 2;
  if (value <= 75) return 3;
  return 4;
}

function toDustForecastLevel(value) {
  if (value === null) return null;
  if (value <= 25) return 1;
  if (value <= 50) return 2;
  if (value <= 75) return 3;
  return 4;
}

function average(values) {
  const valid = values.filter((value) => value !== null);
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getDayIndex(dayId) {
  if (dayId === "tomorrow") return 1;
  if (dayId === "dayAfterTomorrow") return 2;
  return 0;
}

function getDateLabel(dayId) {
  if (dayId === "tomorrow") return "내일";
  if (dayId === "dayAfterTomorrow") return "모레";
  return "오늘";
}

function getDisplayDate(dayId) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + getDayIndex(dayId));

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function extractKmaDayLevel(item, dayId) {
  const rawValue = item[`value${getDayIndex(dayId)}`];
  return toDashboardLevelFromPollen(rawValue, item.TF === "T");
}

function extractDustForecastLevel(item, dayId) {
  const values = Array.from({ length: 24 }, (_, index) => parseNumber(item[`value${index}`])).filter(
    (value) => value !== null,
  );
  if (!values.length) return null;

  const chunks = [values.slice(0, 8), values.slice(8, 16), values.slice(16, 24)];
  const dayChunk = chunks[getDayIndex(dayId)] ?? chunks[0];
  const peakValue = Math.max(...dayChunk);
  return toDustForecastLevel(peakValue);
}

function buildMetricMeta(level, source, extra = {}) {
  return {
    level,
    source,
    ...extra,
  };
}

async function fetchKmaRegion(regionId) {
  const region = REGION_API_MAP[regionId];
  if (!region) {
    throw new Error(`Unknown region: ${regionId}`);
  }

  return getCached(`kma:${regionId}`, 15 * 60 * 1000, async () => {
    const url = new URL("https://www.weather.go.kr/w/resources/jsp/life/area_life_new.json.jsp");
    url.searchParams.set("area", region.wideCode);
    return fetchJson(url);
  });
}

async function fetchAirKoreaRegion(regionId) {
  const serviceKey = env.AIRKOREA_API_KEY;
  if (!serviceKey) {
    return {
      available: false,
      reason: "AIRKOREA_API_KEY missing",
    };
  }

  const region = REGION_API_MAP[regionId];
  try {
    const url = new URL("https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty");
    url.searchParams.set("serviceKey", serviceKey);
    url.searchParams.set("returnType", "json");
    url.searchParams.set("numOfRows", "100");
    url.searchParams.set("pageNo", "1");
    url.searchParams.set("sidoName", region.airkoreaName);
    url.searchParams.set("ver", "1.0");

    const data = await fetchJson(url);
    const items = data?.response?.body?.items ?? [];
    const pm10Avg = average(items.map((item) => parseNumber(item.pm10Value)));
    const pm25Avg = average(items.map((item) => parseNumber(item.pm25Value)));
    const dustLevel = toAirLevelFromPm10(pm10Avg) ?? toAirLevelFromPm25(pm25Avg);

    return {
      available: dustLevel !== null,
      pm10Avg,
      pm25Avg,
      dustLevel,
    };
  } catch (error) {
    return {
      available: false,
      reason: error.message,
    };
  }
}

async function refreshAirRealtimeSnapshot(options = {}) {
  const { force = false } = options;
  const hasFreshSnapshot = airRealtimeSnapshot.updatedAt && airRealtimeSnapshot.expiresAt > Date.now();

  if (!env.AIRKOREA_API_KEY) {
    return airRealtimeSnapshot;
  }

  if (!force && hasFreshSnapshot) {
    return airRealtimeSnapshot;
  }

  if (airRefreshPromise) {
    return airRefreshPromise;
  }

  airRefreshPromise = (async () => {
    const nextRegions = { ...airRealtimeSnapshot.regions };
    let pendingRegionIds = Object.keys(REGION_API_MAP);

    for (let attempt = 1; attempt <= AIRKOREA_MAX_ATTEMPTS && pendingRegionIds.length; attempt += 1) {
      const failedRegionIds = [];

      for (const [index, regionId] of pendingRegionIds.entries()) {
        if (index > 0) {
          await sleep(attempt === 1 ? AIRKOREA_REQUEST_DELAY_MS : AIRKOREA_RETRY_DELAY_MS);
        }

        const realtime = await fetchAirKoreaRegion(regionId);
        const previous = nextRegions[regionId];

        if (realtime.available) {
          nextRegions[regionId] = {
            ...realtime,
            regionId,
            fetchedAt: new Date().toISOString(),
          };
          continue;
        }

        if (previous) {
          nextRegions[regionId] = {
            ...previous,
            lastError: realtime.reason,
          };
        } else {
          nextRegions[regionId] = {
            ...realtime,
            regionId,
            fetchedAt: new Date().toISOString(),
          };
        }

        failedRegionIds.push(regionId);
      }

      pendingRegionIds = failedRegionIds.filter((regionId) => !nextRegions[regionId]?.available);

      if (pendingRegionIds.length && attempt < AIRKOREA_MAX_ATTEMPTS) {
        await sleep(AIRKOREA_RETRY_DELAY_MS);
      }
    }

    airRealtimeSnapshot = {
      updatedAt: new Date().toISOString(),
      expiresAt: Date.now() + AIRKOREA_REFRESH_MS,
      regions: nextRegions,
    };

    return airRealtimeSnapshot;
  })().finally(() => {
    airRefreshPromise = null;
  });

  return airRefreshPromise;
}

async function getAirRealtimeRegion(regionId) {
  if (!env.AIRKOREA_API_KEY) {
    return {
      available: false,
      reason: "AIRKOREA_API_KEY missing",
    };
  }

  const hasSnapshot = airRealtimeSnapshot.updatedAt && Object.keys(airRealtimeSnapshot.regions).length > 0;

  if (!hasSnapshot) {
    await refreshAirRealtimeSnapshot({ force: true });
  } else if (airRealtimeSnapshot.expiresAt <= Date.now()) {
    void refreshAirRealtimeSnapshot();
  }

  return (
    airRealtimeSnapshot.regions[regionId] ?? {
      available: false,
      reason: "AirKorea realtime cache warming up",
    }
  );
}

async function buildRegionForecast(regionId, dayId) {
  const kmaData = await fetchKmaRegion(regionId);
  const items = kmaData.data_json ?? [];
  const oakItem = items.find((item) => item.code === "D06");
  const pineItem = items.find((item) => item.code === "D07");
  const weedItem = items.find((item) => item.code === "D08");
  const dustForecastItem = items.find((item) => item.code === "A09");

  const oak = buildMetricMeta(extractKmaDayLevel(oakItem, dayId), "kma-weather", {
    available: oakItem?.TF === "T",
  });
  const pine = buildMetricMeta(extractKmaDayLevel(pineItem, dayId), "kma-weather", {
    available: pineItem?.TF === "T",
  });
  const weed = buildMetricMeta(extractKmaDayLevel(weedItem, dayId), "kma-weather", {
    available: weedItem?.TF === "T",
  });

  const dustForecastLevel = dustForecastItem ? extractDustForecastLevel(dustForecastItem, dayId) : null;
  let dust = buildMetricMeta(dustForecastLevel, "kma-air-stagnation");

  if (dayId === "today") {
    const realtimeDust = await getAirRealtimeRegion(regionId);
    if (realtimeDust.available) {
      dust = buildMetricMeta(realtimeDust.dustLevel, "airkorea-realtime", {
        pm10Avg: realtimeDust.pm10Avg,
        pm25Avg: realtimeDust.pm25Avg,
      });
    } else {
      dust = buildMetricMeta(null, "airkorea-realtime", {
        available: false,
        fallbackReason: realtimeDust.reason,
      });
    }
  }

  return {
    metrics: {
      oak,
      pine,
      weed,
      dust,
    },
    kmaFileTime: oakItem?.filetime ?? dustForecastItem?.filetime ?? null,
  };
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const itemIndex = currentIndex;
      currentIndex += 1;
      results[itemIndex] = await mapper(items[itemIndex], itemIndex);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

async function buildForecastResponse(dayId) {
  if (dayId === "today") {
    await refreshAirRealtimeSnapshot();
  }

  const regionIds = Object.keys(REGION_API_MAP);
  const results = await mapWithConcurrency(regionIds, 6, async (regionId) => {
    return [regionId, await buildRegionForecast(regionId, dayId)];
  });

  return {
    ok: true,
    day: dayId,
    dateLabel: getDateLabel(dayId),
    displayDate: getDisplayDate(dayId),
    generatedAt: new Date().toISOString(),
    source: {
      pollen: "기상청 날씨누리 종합지수 JSON",
      dustForecast: "기상청 날씨누리 종합지수 JSON",
      dustRealtime: env.AIRKOREA_API_KEY ? "에어코리아 시도별 실시간 측정정보" : null,
    },
    regions: Object.fromEntries(results),
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);

    if (requestUrl.pathname === "/api/forecast") {
      const day = requestUrl.searchParams.get("day") || "today";
      if (!["today", "tomorrow", "dayAfterTomorrow"].includes(day)) {
        sendJson(res, 400, { ok: false, message: "Invalid day parameter" });
        return;
      }

      const payload = await buildForecastResponse(day);
      sendJson(res, 200, payload);
      return;
    }

    serveStatic(res, requestUrl.pathname);
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      message: error.message,
    });
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  void refreshAirRealtimeSnapshot({ force: true });
});

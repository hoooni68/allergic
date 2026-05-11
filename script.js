const metrics = [
  { key: "oak", label: "꽃가루(참나무)", description: "기상청 꽃가루농도위험지수" },
  { key: "pine", label: "꽃가루(소나무)", description: "기상청 꽃가루농도위험지수" },
  { key: "weed", label: "꽃가루(잡초류)", description: "기상청 꽃가루농도위험지수" },
  { key: "dust", label: "황사 및 미세먼지 정도", description: "기상청 예보 + 에어코리아 실시간" },
];

const dayOptions = [
  { id: "today", label: "오늘", offset: 0 },
  { id: "tomorrow", label: "내일", offset: 1 },
  { id: "dayAfterTomorrow", label: "모레", offset: 2 },
];

const levelMeta = {
  1: { label: "좋음", color: "var(--level-1)", chipClass: "level-1", tileClass: "tile-level-1" },
  2: { label: "보통", color: "var(--level-2)", chipClass: "level-2", tileClass: "tile-level-2" },
  3: { label: "나쁨", color: "var(--level-3)", chipClass: "level-3", tileClass: "tile-level-3" },
  4: { label: "매우 나쁨", color: "var(--level-4)", chipClass: "level-4", tileClass: "tile-level-4" },
  na: { label: "비제공", color: "rgba(120, 140, 132, 0.36)", chipClass: "level-na", tileClass: "tile-level-na" },
};

const regionData = [
  {
    id: "seoul",
    name: "서울",
    shortName: "서울",
    center: { lat: 37.5665, lng: 126.978 },
    grid: "1 / 2 / span 1 / span 1",
    summary: "도심권은 꽃가루와 대기질이 함께 체감될 가능성이 높아요.",
    tip: "출근 전 공기질과 꽃가루 단계를 함께 확인하고 마스크를 챙겨 주세요.",
  },
  {
    id: "incheon",
    name: "인천",
    shortName: "인천",
    center: { lat: 37.4563, lng: 126.7052 },
    grid: "2 / 1 / span 1 / span 1",
    summary: "서해권 영향으로 대기질이 빠르게 변할 수 있어요.",
    tip: "바람이 있어도 미세먼지 지표는 별도로 확인하는 편이 안전해요.",
  },
  {
    id: "gyeonggi",
    name: "경기",
    shortName: "경기",
    center: { lat: 37.4138, lng: 127.5183 },
    grid: "2 / 2 / span 1 / span 2",
    summary: "생활권이 넓어 지역 간 체감 차이가 날 수 있어요.",
    tip: "이동량이 많다면 차량 내 공기순환 설정도 함께 챙겨 주세요.",
  },
  {
    id: "gangwon",
    name: "강원",
    shortName: "강원",
    center: { lat: 37.8228, lng: 128.1555 },
    grid: "2 / 4 / span 2 / span 2",
    summary: "산림권은 수목성 꽃가루가 더 또렷하게 느껴질 수 있어요.",
    tip: "야외 일정 전에는 항히스타민 복용 시점을 미리 맞춰 두면 편해요.",
  },
  {
    id: "sejong",
    name: "세종",
    shortName: "세종",
    center: { lat: 36.4801, lng: 127.289 },
    grid: "3 / 2 / span 1 / span 1",
    summary: "전반적으로 균형형 지표가 나오는 편이라 복합 자극에 주의하면 좋아요.",
    tip: "환기는 짧게 여러 번 하는 방식이 무난해요.",
  },
  {
    id: "chungnam",
    name: "충남",
    shortName: "충남",
    center: { lat: 36.5184, lng: 126.8 },
    grid: "3 / 1 / span 2 / span 1",
    summary: "서해 유입과 내륙 조건이 함께 작용해 체감 변동이 있어요.",
    tip: "실외 빨래보다는 실내 건조가 더 편안할 수 있어요.",
  },
  {
    id: "daejeon",
    name: "대전",
    shortName: "대전",
    center: { lat: 36.3504, lng: 127.3845 },
    grid: "4 / 2 / span 1 / span 1",
    summary: "꽃가루 반응이 먼저 느껴질 때가 많아 예민한 날은 외출 시간을 조절하면 좋아요.",
    tip: "안경이나 모자를 함께 착용하면 체감 자극을 줄이는 데 도움이 돼요.",
  },
  {
    id: "chungbuk",
    name: "충북",
    shortName: "충북",
    center: { lat: 36.6357, lng: 127.4917 },
    grid: "4 / 3 / span 1 / span 1",
    summary: "전 항목이 비슷하게 올라올 수 있어 복합 관리가 중요해요.",
    tip: "컨디션이 예민한 날은 야외 체류 시간을 조금 줄여 보세요.",
  },
  {
    id: "gwangju",
    name: "광주",
    shortName: "광주",
    center: { lat: 35.1595, lng: 126.8526 },
    grid: "5 / 1 / span 1 / span 1",
    summary: "잡초류 시즌에는 재채기나 코막힘이 더 두드러질 수 있어요.",
    tip: "하천 산책로나 잔디 공간에서는 마스크 착용이 더 도움이 됩니다.",
  },
  {
    id: "jeonbuk",
    name: "전북",
    shortName: "전북",
    center: { lat: 35.7175, lng: 127.153 },
    grid: "5 / 2 / span 1 / span 1",
    summary: "초본류 꽃가루 체감이 높아지는 시기에는 코 증상이 빨리 올라올 수 있어요.",
    tip: "외출 후 겉옷 먼지를 털고 들어오면 자극을 조금 줄일 수 있어요.",
  },
  {
    id: "jeonnam",
    name: "전남",
    shortName: "전남",
    center: { lat: 34.8679, lng: 126.991 },
    grid: "6 / 1 / span 1 / span 2",
    summary: "대체로 안정적이어도 오후 대기질 변동은 따로 확인하는 편이 좋아요.",
    tip: "공기청정기 필터 상태도 함께 점검해 두면 좋아요.",
  },
  {
    id: "daegu",
    name: "대구",
    shortName: "대구",
    center: { lat: 35.8714, lng: 128.6014 },
    grid: "5 / 4 / span 1 / span 1",
    summary: "건조한 날에는 꽃가루와 먼지가 함께 자극을 줄 수 있어요.",
    tip: "야외 운동은 공기질이 낮은 시간대로 옮기는 편이 더 편안할 수 있어요.",
  },
  {
    id: "gyeongbuk",
    name: "경북",
    shortName: "경북",
    center: { lat: 36.4919, lng: 128.8889 },
    grid: "4 / 4 / span 2 / span 2",
    summary: "수목성 꽃가루가 겹쳐 체감될 수 있으니 숲길 이동 시 특히 주의해 주세요.",
    tip: "여벌 마스크를 챙겨 두면 이동 중 대응이 쉬워요.",
  },
  {
    id: "ulsan",
    name: "울산",
    shortName: "울산",
    center: { lat: 35.5384, lng: 129.3114 },
    grid: "5 / 6 / span 1 / span 1",
    summary: "해안권이라도 대기질이 항상 낮은 것은 아니라서 수치 확인이 중요해요.",
    tip: "출퇴근 시간대에는 KF 계열 마스크를 우선적으로 권장해요.",
  },
  {
    id: "busan",
    name: "부산",
    shortName: "부산",
    center: { lat: 35.1796, lng: 129.0756 },
    grid: "6 / 5 / span 1 / span 1",
    summary: "전반적으로 무난해 보여도 예민한 분은 해안 바람보다 수치를 먼저 보는 편이 좋아요.",
    tip: "해변 산책 전에는 미세먼지 단계와 꽃가루 단계를 함께 확인해 주세요.",
  },
  {
    id: "gyeongnam",
    name: "경남",
    shortName: "경남",
    center: { lat: 35.4606, lng: 128.2132 },
    grid: "6 / 3 / span 1 / span 2",
    summary: "대체로 보통 수준이라도 예민한 날에는 눈·코 증상이 동시에 올 수 있어요.",
    tip: "콘택트렌즈보다 안경이 더 편안하게 느껴질 수 있어요.",
  },
  {
    id: "jeju",
    name: "제주",
    shortName: "제주",
    center: { lat: 33.4996, lng: 126.5312 },
    grid: "7 / 2 / span 1 / span 2",
    summary: "비교적 맑아도 바람 방향에 따라 꽃가루 체감이 달라질 수 있어요.",
    tip: "야외 일정이 길면 휴대용 식염수 스프레이를 챙겨 보세요.",
  },
];

const metricGrid = document.getElementById("metric-grid");
const dateTabs = document.getElementById("date-tabs");
const regionTabs = document.getElementById("region-tabs");
const koreaMap = document.getElementById("korea-map");

const selectedRegionName = document.getElementById("selected-region-name");
const selectedRegionDust = document.getElementById("selected-region-dust");
const selectedRegionReading = document.getElementById("selected-region-reading");
const heroPanelLabel = document.getElementById("hero-panel-label");
const locationStatus = document.getElementById("location-status");
const dataSourceNote = document.getElementById("data-source-note");
const detailCard = document.getElementById("detail-card");
const detailTitle = document.getElementById("detail-title");
const detailBadge = document.getElementById("detail-badge");
const detailSummary = document.getElementById("detail-summary");
const oakLevel = document.getElementById("oak-level");
const pineLevel = document.getElementById("pine-level");
const weedLevel = document.getElementById("weed-level");
const weedDetailRow = document.getElementById("weed-detail-row");
const dustLevel = document.getElementById("dust-level");

let selectedRegionId = "seoul";
let selectedDayId = "today";
let currentLocationRegionId = null;
let liveForecastByDay = {};
let hasUserSelectedRegion = false;
let loadingDayId = "today";

function getDateMeta(dayId) {
  const option = dayOptions.find((item) => item.id === dayId) ?? dayOptions[0];
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + option.offset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return {
    ...option,
    displayDate: `${year}.${month}.${day}`,
  };
}

function isWeedSeason(dayId) {
  const option = dayOptions.find((item) => item.id === dayId) ?? dayOptions[0];
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + option.offset);
  const month = date.getMonth() + 1;
  return month >= 8 && month <= 10;
}

function shouldShowWeedMetric(metricData, dayId) {
  return isWeedSeason(dayId) && metricData?.available === true && typeof metricData?.level === "number";
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function getDistanceInKm(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearestRegion(lat, lng) {
  return regionData.reduce((closest, region) => {
    const distance = getDistanceInKm(lat, lng, region.center.lat, region.center.lng);
    if (!closest || distance < closest.distance) {
      return { region, distance };
    }
    return closest;
  }, null);
}

function getRegionById(regionId) {
  return regionData.find((region) => region.id === regionId);
}

function isForecastDayLoading(dayId) {
  return loadingDayId === dayId && !liveForecastByDay[dayId];
}

function getMetricState(level, isLoading = false) {
  if (isLoading) {
    return {
      label: "불러오는 중",
      color: "rgba(120, 140, 132, 0.24)",
      chipClass: "level-na",
      tileClass: "tile-level-na",
    };
  }

  if (typeof level !== "number") {
    return levelMeta.na;
  }
  return levelMeta[level];
}

function getRegionForecast(regionId, dayId = selectedDayId) {
  return liveForecastByDay[dayId]?.regions?.[regionId] ?? null;
}

function getCurrentReferenceMeta() {
  return getDateMeta("today");
}

function createGauge(level) {
  if (typeof level !== "number") {
    return Array.from({ length: 4 }, () => '<span class="gauge-segment"></span>').join("");
  }

  return Array.from({ length: 4 }, (_, index) => {
    const segmentLevel = index + 1;
    const active = segmentLevel <= level;
    const color = levelMeta[segmentLevel].color;
    return `
      <span
        class="gauge-segment ${active ? "active" : ""}"
        style="${active ? `background:${color};` : ""}"
        aria-hidden="true"
      ></span>
    `;
  }).join("");
}

function formatMetricLabel(metricData, isLoading = false) {
  if (isLoading) {
    return "불러오는 중";
  }

  const state = getMetricState(metricData?.level, isLoading);
  return state.label;
}

function formatSourceLine(metricKey, metricData, isLoading = false) {
  if (isLoading) {
    return "실시간 데이터를 불러오는 중입니다.";
  }

  if (metricData?.available === false) {
    return metricKey === "dust" ? "에어코리아 실시간 수치를 아직 받지 못했습니다." : "현재 비제공 기간입니다.";
  }

  if (metricKey === "dust" && metricData?.source === "airkorea-realtime" && metricData.pm10Avg && metricData.pm25Avg) {
    return `PM10 ${metricData.pm10Avg.toFixed(0)} / PM2.5 ${metricData.pm25Avg.toFixed(0)} 기준`;
  }

  if (metricKey === "dust" && metricData?.source === "kma-air-stagnation") {
    return "기상청 대기정체지수 기반 예보";
  }

  return "기상청 종합지수 기준";
}

function formatDustReading(metricData, isLoading = false) {
  if (isLoading) {
    return "미세먼지 수치를 불러오는 중입니다.";
  }

  if (metricData?.pm10Avg !== undefined && metricData?.pm10Avg !== null) {
    const pm10 = metricData.pm10Avg.toFixed(0);
    const pm25 =
      metricData?.pm25Avg !== undefined && metricData?.pm25Avg !== null ? metricData.pm25Avg.toFixed(0) : null;
    return pm25 ? `미세먼지 PM10 ${pm10}μg/m³ · 초미세먼지 PM2.5 ${pm25}μg/m³` : `미세먼지 PM10 ${pm10}μg/m³`;
  }

  return "실시간 미세먼지 수치를 아직 받지 못했습니다.";
}

function renderDateTabs() {
  dateTabs.innerHTML = dayOptions
    .map((day) => {
      const meta = getDateMeta(day.id);
      return `
        <button
          class="date-tab ${selectedDayId === day.id ? "active" : ""}"
          type="button"
          role="tab"
          aria-selected="${selectedDayId === day.id}"
          data-day="${day.id}"
        >
          <span class="date-tab-label">${meta.label}</span>
          <span class="date-tab-value">${meta.displayDate}</span>
        </button>
      `;
    })
    .join("");
}

function renderMetrics(region) {
  const forecast = getRegionForecast(region.id, selectedDayId);
  const dateMeta = getDateMeta(selectedDayId);
  const isLoading = isForecastDayLoading(selectedDayId);
  const visibleMetrics = metrics.filter(
    (metric) => metric.key !== "weed" || shouldShowWeedMetric(forecast?.metrics?.weed, selectedDayId),
  );

  metricGrid.className = `metric-grid ${visibleMetrics.length === 3 ? "count-3" : ""}`.trim();
  metricGrid.innerHTML = visibleMetrics
    .map((metric) => {
      const metricData = forecast?.metrics?.[metric.key];
      const state = getMetricState(metricData?.level, isLoading);
      return `
        <article class="metric-card ${state.chipClass}">
          <div class="metric-label">
            <div>
              <strong>${metric.label}</strong>
              <span>${metric.description}</span>
            </div>
            <span class="metric-level ${state.chipClass}">${state.label}</span>
          </div>
          <div class="gauge" role="img" aria-label="${metric.label} ${state.label}">
            ${createGauge(metricData?.level)}
          </div>
          <p class="gauge-caption">${dateMeta.label} ${region.name} 기준 ${formatSourceLine(metric.key, metricData, isLoading)}</p>
        </article>
      `;
    })
    .join("");
}

function renderTabs() {
  regionTabs.innerHTML = regionData
    .map(
      (region) => `
        <button
          class="region-tab ${selectedRegionId === region.id ? "active" : ""}"
          role="tab"
          type="button"
          aria-selected="${selectedRegionId === region.id}"
          data-region="${region.id}"
        >
          ${region.name}
        </button>
      `,
    )
    .join("");
}

function renderMap() {
  const isLoading = isForecastDayLoading(selectedDayId);
  koreaMap.innerHTML = regionData
    .map((region) => {
      const forecast = getRegionForecast(region.id, selectedDayId);
      const dustState = getMetricState(forecast?.metrics?.dust?.level ?? 1, isLoading);
      return `
        <button
          class="region-tile ${dustState.tileClass} ${selectedRegionId === region.id ? "active" : ""}"
          type="button"
          style="grid-area:${region.grid};"
          data-region="${region.id}"
          aria-pressed="${selectedRegionId === region.id}"
          aria-label="${region.name} 미세먼지 ${dustState.label}"
        >
          <span class="region-name">${region.shortName}</span>
          <span class="map-level ${dustState.chipClass}">${dustState.label}</span>
        </button>
      `;
    })
    .join("");
}

function updateHeroPanel() {
  const heroRegion = getRegionById(currentLocationRegionId) ?? getRegionById(selectedRegionId);
  const heroForecast = getRegionForecast(heroRegion.id, "today");
  const isLoading = isForecastDayLoading("today");
  const dustState = getMetricState(heroForecast?.metrics?.dust?.level, isLoading);
  const hasGps = Boolean(currentLocationRegionId);
  const currentMeta = getCurrentReferenceMeta();

  heroPanelLabel.textContent = hasGps ? "현재 위치 기반" : "현재 위치 미확인";
  selectedRegionName.textContent = heroRegion.name;
  selectedRegionDust.textContent = `현재 · 황사·미세먼지 ${dustState.label}`;
  selectedRegionReading.textContent = formatDustReading(heroForecast?.metrics?.dust, isLoading);

  if (hasGps) {
    locationStatus.textContent = `GPS 기준 ${currentMeta.displayDate} 현재 ${heroRegion.name}입니다.`;
  } else {
    locationStatus.textContent = "위치 권한이 없으면 상단은 선택한 지역 기준으로 표시됩니다.";
  }
}

function updateDetails(region) {
  const forecast = getRegionForecast(region.id, "today");
  const dateMeta = getCurrentReferenceMeta();
  const isLoading = isForecastDayLoading("today");
  const dustState = getMetricState(forecast?.metrics?.dust?.level, isLoading);
  const showWeed = shouldShowWeedMetric(forecast?.metrics?.weed, "today");

  detailTitle.textContent = `${region.name}의 오늘`;
  detailSummary.textContent = `현재(${dateMeta.displayDate}) 기준 ${region.summary}`;
  detailBadge.textContent = dustState.label;
  detailBadge.className = `detail-badge ${dustState.chipClass}`;
  detailCard.className = `detail-card compact-detail-card ${dustState.tileClass}`;
  oakLevel.textContent = formatMetricLabel(forecast?.metrics?.oak, isLoading);
  pineLevel.textContent = formatMetricLabel(forecast?.metrics?.pine, isLoading);
  weedDetailRow.hidden = !showWeed;
  weedDetailRow.style.display = showWeed ? "" : "none";
  weedLevel.textContent = formatMetricLabel(forecast?.metrics?.weed, isLoading);
  dustLevel.textContent = formatMetricLabel(forecast?.metrics?.dust, isLoading);
}

function renderAll() {
  const selectedRegion = getRegionById(selectedRegionId);
  renderDateTabs();
  renderTabs();
  renderMap();
  renderMetrics(selectedRegion);
  updateDetails(selectedRegion);
  updateHeroPanel();
}

async function loadLiveForecast(dayId) {
  loadingDayId = dayId;
  dataSourceNote.textContent = "기상청과 에어코리아 데이터를 불러오는 중입니다.";
  renderAll();

  try {
    const response = await fetch(`/api/forecast?day=${dayId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    liveForecastByDay[dayId] = await response.json();
    loadingDayId = null;
    const realtimeSource = liveForecastByDay[dayId].source.dustRealtime
      ? `, 미세먼지 실시간은 ${liveForecastByDay[dayId].source.dustRealtime}`
      : "";
    dataSourceNote.textContent = `꽃가루와 대기정체 예보는 ${liveForecastByDay[dayId].source.pollen}${realtimeSource}를 사용합니다.`;
    renderAll();
  } catch (error) {
    loadingDayId = null;
    dataSourceNote.textContent = "실데이터 연결에 실패해 화면 표시가 제한될 수 있습니다.";
    renderAll();
  }
}

function selectRegion(regionId) {
  selectedRegionId = regionId;
  hasUserSelectedRegion = true;
  renderAll();
}

async function selectDay(dayId) {
  selectedDayId = dayId;
  renderDateTabs();
  if (liveForecastByDay[dayId]) {
    renderAll();
    return;
  }
  await loadLiveForecast(dayId);
}

function bindSelectionEvents() {
  document.addEventListener("click", (event) => {
    const dayTrigger = event.target.closest("[data-day]");
    if (dayTrigger) {
      void selectDay(dayTrigger.dataset.day);
      return;
    }

    const regionTrigger = event.target.closest("[data-region]");
    if (!regionTrigger) return;
    selectRegion(regionTrigger.dataset.region);
  });
}

function detectCurrentLocation() {
  if (!navigator.geolocation) {
    renderAll();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const nearest = getNearestRegion(position.coords.latitude, position.coords.longitude);
      if (nearest) {
        currentLocationRegionId = nearest.region.id;
        if (!hasUserSelectedRegion) {
          selectedRegionId = nearest.region.id;
        }
      }
      renderAll();
    },
    () => {
      renderAll();
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    },
  );
}

bindSelectionEvents();
renderAll();
detectCurrentLocation();
void loadLiveForecast(selectedDayId);

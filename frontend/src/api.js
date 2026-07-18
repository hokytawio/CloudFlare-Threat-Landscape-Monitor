const BASE_URL = "http://localhost:8000/api";

async function get(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${path}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Erro ${res.status} em ${path}: ${body}`);
  }
  return res.json();
}

export const radarApi = {
  layer3Timeseries: (location = "PT") => get("/attacks/layer3/timeseries", { location }),
  layer7Timeseries: (location = "PT") => get("/attacks/layer7/timeseries", { location }),
  layer3TopOrigins: (location = "PT") => get("/attacks/layer3/top-origins", { location }),
  layer7TopOrigins: (location = "PT") => get("/attacks/layer7/top-origins", { location }),
  botClass: (location = "PT") => get("/http/bot-class", { location }),
  ipVersion: (location = "PT") => get("/http/ip-version", { location }),
  anomalies: (location = "PT") => get("/anomalies", { location }),
};

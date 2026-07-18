import { useEffect, useState } from "react";
import { radarApi } from "./api";
import TitleBar from "./components/TitleBar";
import Taskbar from "./components/Taskbar";
import IntroSection from "./components/IntroSection";
import RadarSweep from "./components/RadarSweep";
import StatCard from "./components/StatCard";
import AttacksTimeline from "./components/AttacksTimeline";
import ThreatGlossary from "./components/ThreatGlossary";
import AnomaliesFeed from "./components/AnomaliesFeed";

/**
 * NOTA IMPORTANTE:
 * A forma exata do JSON devolvido por cada endpoint da Radar API pode variar
 * ligeiramente (a Cloudflare tem vindo a fazer upgrades para "summary_v2" nalguns
 * endpoints). As funções parseX() abaixo fazem uma extração defensiva com
 * fallbacks — se um gráfico aparecer vazio, abre o DevTools > Network, olha para
 * a resposta real do endpoint em causa, e ajusta o caminho correspondente aqui.
 */

function parseTimeseries(l3json, l7json) {
  try {
    const l3 = l3json?.result?.serie_0 ?? {};
    const l7 = l7json?.result?.serie_0 ?? {};
    const timestamps = l3.timestamps ?? l7.timestamps ?? [];
    return timestamps.map((ts, i) => ({
      date: new Date(ts).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }),
      layer3: Number(l3.values?.[i] ?? 0),
      layer7: Number(l7.values?.[i] ?? 0),
    }));
  } catch {
    return [];
  }
}

function parseTopOrigins(json) {
  try {
    const top = json?.result?.top_0 ?? [];
    return top.map((item) => ({
      code: item.originCountryAlpha2 ?? item.origin ?? "??",
      name: item.originCountryName ?? item.originCountryAlpha2 ?? "Desconhecido",
      value: Number(item.value ?? 0),
    }));
  } catch {
    return [];
  }
}

function parseBotClass(json) {
  try {
    const s = json?.result?.summary_0 ?? {};
    const bot = Number(s.bot ?? 0);
    return bot;
  } catch {
    return 0;
  }
}

function parseIpVersion(json) {
  try {
    const s = json?.result?.summary_0 ?? {};
    return Number(s.IPv6 ?? s.ipv6 ?? 0);
  } catch {
    return 0;
  }
}

function parseAnomalies(json) {
  try {
    const list = json?.result?.annotations ?? json?.result ?? [];
    if (!Array.isArray(list)) return [];
    return list.slice(0, 6).map((a) => ({
      description: a.description ?? a.eventType ?? "Anomalia sem descrição",
      location: (a.locations ?? [a.location]).filter(Boolean).join(", ") || "Global",
      startDate: a.startDate ? new Date(a.startDate).toLocaleDateString("pt-PT") : "",
    }));
  } catch {
    return [];
  }
}

export default function App() {
  const [status, setStatus] = useState("loading");
  const [timeline, setTimeline] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [botPct, setBotPct] = useState(0);
  const [ipv6Pct, setIpv6Pct] = useState(0);
  const [anomalies, setAnomalies] = useState([]);

  async function loadAll() {
    setStatus("loading");

    // allSettled em vez de all: se um endpoint falhar (ex. rate limit,
    // parâmetro em falta), os restantes widgets continuam a mostrar dados
    // em vez do dashboard inteiro cair. Cada resultado é ou {status:'fulfilled',
    // value} ou {status:'rejected', reason}.
    const [l3ts, l7ts, l3origins, bots, ipv, anom] = await Promise.allSettled([
      radarApi.layer3Timeseries(),
      radarApi.layer7Timeseries(),
      radarApi.layer3TopOrigins(),
      radarApi.botClass(),
      radarApi.ipVersion(),
      radarApi.anomalies(),
    ]);

    const failures = [l3ts, l7ts, l3origins, bots, ipv, anom].filter(
      (r) => r.status === "rejected"
    );
    failures.forEach((f) => console.error("Pedido falhou:", f.reason));

    setTimeline(
      parseTimeseries(
        l3ts.status === "fulfilled" ? l3ts.value : null,
        l7ts.status === "fulfilled" ? l7ts.value : null
      )
    );
    setOrigins(l3origins.status === "fulfilled" ? parseTopOrigins(l3origins.value) : []);
    setBotPct(bots.status === "fulfilled" ? parseBotClass(bots.value) : 0);
    setIpv6Pct(ipv.status === "fulfilled" ? parseIpVersion(ipv.value) : 0);
    setAnomalies(anom.status === "fulfilled" ? parseAnomalies(anom.value) : []);

    // "live" se pelo menos um pedido teve sucesso; "error" só se todos falharem
    setStatus(failures.length === 6 ? "error" : "live");
  }

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 5 * 60 * 1000); // refresca a cada 5 min
    return () => clearInterval(interval);
  }, []);

  const loading = status === "loading";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="window">
        <TitleBar status={status} />

        <div className="window-body p-3">
          {status === "error" && (
            <div className="sunken p-3 mb-4 text-[11px]" style={{ background: "#FFCCCC" }}>
              ⚠ Não foi possível ligar ao backend em http://localhost:8000. Confirma
              que o FastAPI está a correr (uvicorn app.main:app --reload) e que o
              teu CLOUDFLARE_API_TOKEN está definido em backend/.env.
            </div>
          )}

          <IntroSection />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <StatCard
              label="Tráfego automatizado (bots)"
              value={loading ? "—" : botPct.toFixed(1)}
              unit="%"
              accent="maroon"
              hint="Quanto maior, maior a exposição a scraping e reconhecimento automatizado — relevante para dimensionar proteção anti-bot"
            />
            <StatCard
              label="Adoção IPv6"
              value={loading ? "—" : ipv6Pct.toFixed(1)}
              unit="%"
              accent="navy"
              hint="Redes muito dependentes de IPv4/NAT dificultam atribuir tráfego a uma origem específica numa investigação"
            />
            <StatCard
              label="Anomalias ativas"
              value={loading ? "—" : anomalies.length}
              accent={anomalies.length > 0 ? "maroon" : "green"}
              hint="Eventos já confirmados pela Cloudflare como desvio do padrão normal, não uma estimativa desta aplicação"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
            <div className="lg:col-span-1">
              <RadarSweep origins={origins} loading={loading} />
            </div>
            <div className="lg:col-span-2">
              <AttacksTimeline data={timeline} loading={loading} />
            </div>
          </div>

          <ThreatGlossary />

          <AnomaliesFeed items={anomalies} loading={loading} />
        </div>

        <div className="status-bar">
          <p className="status-bar-field">Dados via Cloudflare Radar API</p>
          <p className="status-bar-field">Atualização automática a cada 5 min</p>
          <p className="status-bar-field">{status === "live" ? "🟢 Ligado" : status === "error" ? "🔴 Erro" : "🟡 A ligar"}</p>
        </div>
      </div>

      <Taskbar status={status} />
    </div>
  );
}

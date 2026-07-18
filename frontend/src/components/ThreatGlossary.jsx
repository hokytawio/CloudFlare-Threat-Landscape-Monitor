const ENTRIES = [
  {
    title: "Ataques Layer 3/4 — volumétricos",
    color: "#000080",
    body:
      "Ataques de rede (DDoS clássico): inundam a ligação com pacotes " +
      "(SYN floods, UDP floods, amplificação DNS/NTP) para esgotar largura " +
      "de banda ou recursos de infraestrutura antes de o pedido sequer " +
      "chegar à aplicação. Um valor alto e sustentado é indicador de uma " +
      "campanha ativa contra ISPs ou serviços expostos em Portugal.",
  },
  {
    title: "Ataques Layer 7 — aplicacionais",
    color: "#800000",
    body:
      "Ataques dirigidos à camada de aplicação web (HTTP floods, ataques a " +
      "APIs, scraping agressivo). São mais difíceis de distinguir de " +
      "tráfego legítimo porque parecem pedidos web normais em grande " +
      "volume — por isso tendem a exigir mitigação mais fina (WAF, rate " +
      "limiting) em vez de só bloquear IPs.",
  },
  {
    title: "Tráfego automatizado (bots)",
    color: "#808000",
    body:
      "Percentagem de pedidos HTTP que não vêm de um browser humano. Nem " +
      "todo o bot é malicioso — inclui crawlers de motores de busca " +
      "legítimos — mas esta métrica sobe tipicamente com scraping não " +
      "autorizado, credential stuffing e reconhecimento automatizado " +
      "contra sites portugueses.",
  },
  {
    title: "Adoção de IPv6",
    color: "#000080",
    body:
      "Não é uma ameaça em si, mas contexto de postura de segurança: redes " +
      "muito dependentes de IPv4 tendem a usar mais NAT, o que dificulta " +
      "atribuir tráfego a uma origem específica durante uma investigação.",
  },
  {
    title: "Anomalias de tráfego",
    color: "#800000",
    body:
      "Eventos que a própria Cloudflare confirmou como desvios do padrão " +
      "normal de tráfego — podem ser outages de operadoras, cortes de " +
      "cabos submarinos, ou picos de ataque grandes o suficiente para " +
      "serem visíveis à escala nacional.",
  },
];

export default function ThreatGlossary() {
  return (
    <fieldset className="groupbox">
      <legend>Glossário de Ameaças Analisadas</legend>
      <div className="sunken p-3 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
        {ENTRIES.map((e) => (
          <div key={e.title} className="flex gap-2">
            <span
              className="w-2.5 h-2.5 mt-1 shrink-0"
              style={{ background: e.color }}
            />
            <div>
              <p className="text-[11px] font-bold mb-0.5">{e.title}</p>
              <p className="text-[10px] leading-relaxed text-black/80">{e.body}</p>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}

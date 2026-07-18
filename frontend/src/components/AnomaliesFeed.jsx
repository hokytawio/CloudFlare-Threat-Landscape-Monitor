export default function AnomaliesFeed({ items, loading }) {
  return (
    <fieldset className="groupbox">
      <legend>Anomalias de Tráfego Recentes</legend>
      <div className="sunken p-2">
        {loading ? (
          <p className="text-[11px] py-6 text-center">A verificar anomalias...</p>
        ) : items.length === 0 ? (
          <p className="text-[11px] py-6 text-center">
            Nenhuma anomalia verificada recentemente.
          </p>
        ) : (
          <ul>
            {items.map((a, i) => (
              <li
                key={i}
                className="flex items-start gap-2 py-1.5 px-1 text-[11px]"
                style={{ background: i % 2 === 0 ? "#fff" : "#e8e8e8" }}
              >
                <span style={{ color: "#800000" }}>⚠</span>
                <div>
                  <p>{a.description}</p>
                  <p className="font-mono text-[10px] text-black/60">
                    {a.location} · {a.startDate}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </fieldset>
  );
}

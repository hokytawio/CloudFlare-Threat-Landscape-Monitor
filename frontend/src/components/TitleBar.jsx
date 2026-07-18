export default function TitleBar({ status }) {
  const statusLabel = {
    loading: "a ligar...",
    live: "ligado",
    error: "sem ligação",
  }[status];

  return (
    <>
      <div className="title-bar">
        <div className="title-bar-text">📡 Radar_PT.exe — Threat Landscape Monitor [{statusLabel}]</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" />
          <button aria-label="Maximize" />
          <button aria-label="Close" />
        </div>
      </div>
      <div className="flex text-xs border-b border-silverDark bg-silver px-1 py-0.5 select-none">
        {["Ficheiro", "Editar", "Ver", "Ferramentas", "Ajuda"].map((item) => (
          <span key={item} className="px-2 py-0.5 hover:bg-navy hover:text-white cursor-default">
            {item}
          </span>
        ))}
      </div>
    </>
  );
}

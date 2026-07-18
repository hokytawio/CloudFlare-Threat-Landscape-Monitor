export default function StatCard({ label, value, unit, accent = "navy", hint }) {
  const accentColor = { navy: "#000080", maroon: "#800000", green: "#006600" }[accent];

  return (
    <div className="sunken p-3 flex flex-col gap-1">
      <p className="text-[11px] font-bold uppercase">{label}</p>
      <p className="font-mono text-2xl font-bold" style={{ color: accentColor }}>
        {value}
        {unit && <span className="text-sm ml-1">{unit}</span>}
      </p>
      {hint && <p className="text-[10px] text-black/70 leading-snug">{hint}</p>}
    </div>
  );
}

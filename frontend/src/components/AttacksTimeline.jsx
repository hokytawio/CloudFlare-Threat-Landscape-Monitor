import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AttacksTimeline({ data, loading }) {
  return (
    <fieldset className="groupbox">
      <legend>Ataques ao Longo do Tempo</legend>

      <div className="flex items-center justify-end gap-4 text-[11px] font-mono mb-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 inline-block" style={{ background: "#000080" }} /> Layer 3
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 inline-block" style={{ background: "#800000" }} /> Layer 7
        </span>
      </div>

      <div className="sunken p-2">
        {loading ? (
          <p className="text-[11px] py-16 text-center">A carregar série temporal...</p>
        ) : data.length === 0 ? (
          <p className="text-[11px] py-16 text-center">Sem dados para o período.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data}>
              <CartesianGrid stroke="#C0C0C0" vertical={false} />
              <XAxis dataKey="date" stroke="#000" fontSize={10} tickLine={false} />
              <YAxis stroke="#000" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#FFFFCC",
                  border: "1px solid #000",
                  fontSize: 11,
                  fontFamily: "Tahoma, sans-serif",
                }}
              />
              <Line type="monotone" dataKey="layer3" stroke="#000080" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="layer7" stroke="#800000" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </fieldset>
  );
}

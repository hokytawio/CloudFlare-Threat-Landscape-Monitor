const SIZE = 380;
const CENTER = SIZE / 2;
const RINGS = [0.28, 0.52, 0.76, 1.0];

function polarToXY(angleDeg, radiusFraction) {
  const r = radiusFraction * (CENTER - 36);
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: CENTER + r * Math.cos(rad),
    y: CENTER + r * Math.sin(rad),
  };
}

export default function RadarSweep({ origins = [], loading }) {
  const items = origins.slice(0, 8);
  const maxValue = Math.max(...items.map((o) => o.value), 1);

  return (
    <fieldset className="groupbox">
      <legend>Origem dos Ataques (ranking radial · 7 dias)</legend>

      <div className="sunken p-3 flex flex-col items-center" style={{ background: "#0a0a0a" }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[360px]">
          {RINGS.map((r) => (
            <circle
              key={r}
              cx={CENTER}
              cy={CENTER}
              r={r * (CENTER - 36)}
              fill="none"
              stroke="#1A8A1A"
              strokeWidth="1"
              strokeOpacity="0.5"
            />
          ))}
          {[0, 45, 90, 135].map((a) => {
            const p1 = polarToXY(a, 1);
            const p2 = polarToXY(a + 180, 1);
            return (
              <line
                key={a}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#1A8A1A"
                strokeWidth="1"
                strokeOpacity="0.5"
              />
            );
          })}

          <g style={{ transformOrigin: `${CENTER}px ${CENTER}px` }} className="animate-sweep">
            <path
              d={`M ${CENTER} ${CENTER} L ${CENTER} ${36} A ${CENTER - 36} ${CENTER - 36} 0 0 1 ${
                polarToXY(35, 1).x
              } ${polarToXY(35, 1).y} Z`}
              fill="url(#sweepGradient)"
            />
          </g>
          <defs>
            <linearGradient id="sweepGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#33FF33" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#33FF33" stopOpacity="0" />
            </linearGradient>
          </defs>

          <circle cx={CENTER} cy={CENTER} r="4" fill="#33FF33" />
          <text
            x={CENTER}
            y={CENTER + 18}
            textAnchor="middle"
            fontFamily="Courier New, monospace"
            fontSize="11"
            fill="#33FF33"
          >
            PT
          </text>

          {items.map((o, i) => {
            const angle = (360 / items.length) * i;
            const radiusFraction = 0.35 + 0.6 * (o.value / maxValue);
            const { x, y } = polarToXY(angle, radiusFraction);
            const blipSize = 3.5 + 5 * (o.value / maxValue);
            return (
              <g key={o.code}>
                <circle
                  cx={x}
                  cy={y}
                  r={blipSize}
                  fill="#33FF33"
                  className="animate-blip"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
                <text
                  x={x}
                  y={y - blipSize - 5}
                  textAnchor="middle"
                  fontFamily="Courier New, monospace"
                  fontSize="10"
                  fill="#33FF33"
                >
                  {o.code}
                </text>
              </g>
            );
          })}
        </svg>

        {loading && (
          <p className="font-mono text-[11px] mt-2" style={{ color: "#33FF33" }}>
            A CARREGAR DADOS...
          </p>
        )}
        {!loading && items.length === 0 && (
          <p className="font-mono text-[11px] mt-2" style={{ color: "#1A8A1A" }}>
            SEM DADOS DE ORIGEM
          </p>
        )}
      </div>
    </fieldset>
  );
}

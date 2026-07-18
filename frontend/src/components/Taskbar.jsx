import { useEffect, useState } from "react";

export default function Taskbar({ status }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  const isLive = status === "live";

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-silver raised flex items-center px-1 gap-1 z-50">
      <button className="btn flex items-center gap-1 font-bold px-2 py-0.5">
        <span>🪟</span> Iniciar
      </button>
      <div className="h-5 w-px bg-silverDark mx-1" />
      <button className="btn flex items-center gap-1.5 px-2 py-0.5 text-xs sunken bg-white">
        <span className={isLive ? "animate-blink" : ""}>📡</span>
        Radar_PT.exe
      </button>
      <div className="flex-1" />
      <div className="sunken px-2 py-0.5 text-xs font-win">🕐 {time}</div>
    </div>
  );
}

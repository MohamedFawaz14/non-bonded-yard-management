import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import ExitReport from "./pages/ExitReport";
import GmailQuery from "./pages/GmailQuery";

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Meta tags
    document.title = "Non-Bonded Yard Management | Dashboard v2.0";
    const setMeta = (name, content, prop = false) => {
      const attr = prop ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("description", "Non-Bonded Yard Management System — track yard reports, exit reports, and Gmail queries.");
    setMeta("viewport", "width=device-width, initial-scale=1.0");
    setMeta("theme-color", "#00EFFF");
    setMeta("og:title", "Non-Bonded Yard Management", true);
    setMeta("og:description", "Dashboard v2.0 — Yard, Exit & Gmail Query tools.", true);
    setMeta("og:type", "website", true);
    setMeta("twitter:card", "summary");
    setMeta("twitter:title", "Non-Bonded Yard Management");
  }, []);

  const tabs = [
    { id: "dashboard", label: "YARD REPORT", icon: "⬡" },
    { id: "exit",      label: "EXIT REPORT",  icon: "🚪" },
    { id: "gmail",     label: "GMAIL QUERY",  icon: "✉" },
  ];

  return (
    <div className={`min-h-screen bg-[#010A1A] font-mono text-[#C8E8FF] transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,239,255,0.015)_2px,rgba(0,239,255,0.015)_4px)]" />

      {/* Top Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-[#020D20] border-b border-[#0D3A6E] shadow-[0_0_24px_rgba(0,239,255,0.08)]">
        <div className="flex items-center gap-3">
          <span className="text-[#00EFFF] text-xl font-bold tracking-widest animate-pulse">⬡</span>
          <span className="text-[#00EFFF] text-base font-bold tracking-[0.2em] uppercase">
            Non-Bonded Yard Management
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#00EFFF] animate-ping inline-block" />
          <span className="text-[#38C8FF] text-xs tracking-widest">DASHBOARD v2.0</span>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex gap-2 px-6 py-3 bg-[#04182E] border-b border-[#0D3A6E]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-5 py-2 text-xs tracking-widest uppercase rounded-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00EFFF]/40 active:scale-95
              ${tab === t.id
                ? "bg-[#003F70] border-[#00EFFF] text-[#00EFFF] shadow-[0_0_16px_rgba(0,239,255,0.3)]"
                : "bg-transparent border-[#0D3A6E] text-[#5AA8E0] hover:border-[#38C8FF] hover:text-[#C8E8FF] hover:bg-[#031525]"
              }`}
          >
            <span className="mr-1">{t.icon}</span> {t.label}
            {tab === t.id && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-[#00EFFF] rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Page */}
      <main className="p-6">
        <div key={tab} className="animate-fadeIn">
          {tab === "dashboard" && <Dashboard />}
          {tab === "exit"      && <ExitReport />}
          {tab === "gmail"     && <GmailQuery />}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.35s ease both; }
      `}</style>
    </div>
  );
}
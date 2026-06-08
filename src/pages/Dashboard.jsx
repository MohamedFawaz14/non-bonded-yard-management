import { useState } from "react";
import api from "../services/api";

const ROWS = [
  { label: "Total Empties Offloaded", total: "offloaded_empty_total", f40: "offloaded_empty_40", f20: "offloaded_empty_20" },
  { label: "Total Empties Loaded",    total: "exited_empty_total",    f40: "exited_empty_40",    f20: "exited_empty_20"    },
  { label: "Total FCL Offloaded",     total: "offloaded_fcl_total",   f40: "offloaded_fcl_40",   f20: "offloaded_fcl_20"   },
  { label: "Total FCL Loaded",        total: "exited_fcl_total",      f40: "exited_fcl_40",      f20: "exited_fcl_20"      },
  { label: "Total Empty Shifting",    total: "shifting_empty_total",  f40: "shifting_empty_40",  f20: "shifting_empty_20"  },
  { label: "Total FCL Shifting",      total: "shifting_fcl_total",    f40: "shifting_fcl_40",    f20: "shifting_fcl_20"    },
  { label: "Truck Sighting",          total: "sighting_total",        f40: "sighting_40",        f20: "sighting_20"        },
  { label: "Total Weighbridge",       total: "weighbridge_total",     f40: null,                 f20: null                 },
  { label: "Total Empties In Yard",   total: "yard_empty_total",      f40: "yard_empty_40",      f20: "yard_empty_20"      },
  { label: "Total FCL In Yard",       total: "yard_fcl_total",        f40: "yard_fcl_40",        f20: "yard_fcl_20"        },
];

function Toast({ msg, type }) {
  if (!msg) return null;
  const colors = type === "error"
    ? "bg-red-900/80 border-red-500 text-red-200"
    : "bg-[#003F70]/80 border-[#00EFFF] text-[#00EFFF]";
  return (
    <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-lg border text-xs tracking-widest shadow-xl animate-fadeIn ${colors}`}>
      {msg}
    </div>
  );
}

export default function Dashboard() {
  const [file, setFile]               = useState(null);
  const [receivedDate, setReceivedDate] = useState("");
  const [exitDate, setExitDate]       = useState("");
  const [report, setReport]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [exporting, setExporting]     = useState("");
  const [toast, setToast]             = useState({ msg: "", type: "" });

  const notify = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const validate = () => {
    if (!file) { notify("⚠ Please select an Excel (.xlsx) file.", "error"); return false; }
    if (!receivedDate) { notify("⚠ Please select a Received Date.", "error"); return false; }
    if (!exitDate) { notify("⚠ Please select an Exit Date.", "error"); return false; }
    if (receivedDate > exitDate) { notify("⚠ Received Date must be before Exit Date.", "error"); return false; }
    return true;
  };

  const generateReport = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("received_date", receivedDate);
      formData.append("exit_date", exitDate);
      const response = await api.post("/dashboard-report", formData);
      setReport(response.data);
      notify("✓ Report generated successfully.");
    } catch (err) {
      notify(err.response?.data?.detail || err.message || "Failed to generate report.", "error");
    } finally {
      setLoading(false);
    }
  };

  const doExport = async (endpoint, filename, label) => {
    if (!validate()) return;
    if (!report) { notify("⚠ Generate the report first.", "error"); return; }
    try {
      setExporting(label);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("received_date", receivedDate);
      formData.append("exit_date", exitDate);
      const res = await api.post(endpoint, formData, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url; a.download = filename; a.click();
      window.URL.revokeObjectURL(url);
      notify(`✓ ${label} exported.`);
    } catch (err) {
      notify(err.response?.data?.detail || "Export failed.", "error");
    } finally {
      setExporting("");
    }
  };

  const Btn = ({ onClick, disabled, children, glow }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-xs tracking-widest uppercase rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00EFFF]/40 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
        ${glow
          ? "bg-[#003F70] border-[#00EFFF] text-[#00EFFF] hover:shadow-[0_0_14px_rgba(0,239,255,0.4)] hover:bg-[#004f88]"
          : "bg-[#04182E] border-[#0D3A6E] text-[#5AA8E0] hover:border-[#38C8FF] hover:text-[#C8E8FF]"
        }`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-[#031525] border border-[#0D3A6E] rounded-2xl p-6 shadow-[0_0_40px_rgba(0,239,255,0.05)]">
      <Toast {...toast} />

      <h2 className="text-[#00EFFF] text-lg font-bold tracking-[0.25em] uppercase mb-6 flex items-center gap-2">
        <span className="text-2xl">⬡</span> Yard Report
      </h2>

      {/* File upload */}
      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#0D3A6E] rounded-xl cursor-pointer hover:border-[#00EFFF]/50 hover:bg-[#00EFFF]/5 transition-all duration-300 mb-5 group">
        <span className="text-[#5AA8E0] text-xs tracking-widest group-hover:text-[#00EFFF] transition-colors">
          {file ? `📂 ${file.name}` : "⬆ DROP / CLICK TO SELECT .xlsx FILE"}
        </span>
        {file && <span className="text-[#38C8FF] text-[10px] mt-1">{(file.size / 1024).toFixed(1)} KB</span>}
        <input type="file" accept=".xlsx" className="hidden" onChange={(e) => { setFile(e.target.files[0]); setReport(null); }} />
      </label>

      {/* Dates + Buttons */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] tracking-widest text-[#5AA8E0] uppercase">Received Date</label>
          <input
            type="date"
            value={receivedDate}
            onChange={(e) => setReceivedDate(e.target.value)}
            className="
        w-full
        bg-[#061D38]
        border border-[#0D3A6E]
        text-[#C8E8FF]
        text-xs
        px-3
        py-2
        rounded-lg
        cursor-pointer
        hover:border-[#00BFFF]
        focus:outline-none
        focus:border-[#00EFFF]
        focus:ring-2
        focus:ring-[#00EFFF]/30
        transition-all
      "
    />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] tracking-widest text-[#5AA8E0] uppercase">Exit Date</label>
          <input
            type="date"
            value={exitDate}
            onChange={(e) => setExitDate(e.target.value)}
            className="
        w-full
        bg-[#061D38]
        border border-[#0D3A6E]
        text-[#C8E8FF]
        text-xs
        px-3
        py-2
        rounded-lg
        cursor-pointer
        hover:border-[#00BFFF]
        focus:outline-none
        focus:border-[#00EFFF]
        focus:ring-2
        focus:ring-[#00EFFF]/30
        transition-all
      "
    />
        </div>

        <div className="flex gap-2 mt-4">
          <Btn onClick={generateReport} disabled={loading} glow>
            {loading ? <span className="flex items-center gap-2"><Spinner /> Generating…</span> : "⚡ Generate"}
          </Btn>
          <Btn onClick={() => doExport("/export-pdf", "yard_report.pdf", "PDF")} disabled={!!exporting || !report}>
            {exporting === "PDF" ? <Spinner /> : "↓ PDF"}
          </Btn>
          <Btn onClick={() => doExport("/export-image", "yard_report.png", "PNG")} disabled={!!exporting || !report}>
            {exporting === "PNG" ? <Spinner /> : "↓ PNG"}
          </Btn>
        </div>
      </div>

      {/* Table */}
      {report && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-[#0D3A6E] animate-fadeIn">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#021530]">
                {["Description", "Total", "40FT", "20FT"].map((h) => (
                  <th key={h} className="text-[#00EFFF] tracking-widest uppercase px-4 py-3 border border-[#0D3A6E] text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={i} className={`transition-colors hover:bg-[#00EFFF]/5 ${i % 2 === 0 ? "bg-[#031525]" : "bg-[#04182E]"}`}>
                  <td className="px-4 py-3 border border-[#0D3A6E] text-[#C8E8FF]">{r.label}</td>
                  <td className="px-4 py-3 border border-[#0D3A6E] text-[#00EFFF] font-bold">{report[r.total] ?? "—"}</td>
                  <td className="px-4 py-3 border border-[#0D3A6E]">{r.f40 ? report[r.f40] ?? "—" : <span className="text-[#5AA8E0]">—</span>}</td>
                  <td className="px-4 py-3 border border-[#0D3A6E]">{r.f20 ? report[r.f20] ?? "—" : <span className="text-[#5AA8E0]">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <svg className="inline animate-spin h-3 w-3 text-[#00EFFF]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>;
}
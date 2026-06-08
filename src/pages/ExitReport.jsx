import { useState } from "react";
import axios from "axios";

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

function Spinner() {
  return <svg className="inline animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>;
}

export default function ExitReport() {
  const [file, setFile]       = useState(null);
  const [exitDate, setExitDate] = useState("");
  const [rows, setRows]       = useState([]);
  const [count, setCount]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState("");
  const [toast, setToast]     = useState({ msg: "", type: "" });

  const notify = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const validate = () => {
    if (!file) { notify("⚠ Please select an Excel file.", "error"); return false; }
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(ext)) { notify("⚠ Only .xlsx or .xls files allowed.", "error"); return false; }
    if (!exitDate) { notify("⚠ Please select an Exit Date.", "error"); return false; }
    return true;
  };

  const generateReport = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      setRows([]); setCount(0);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("exit_date", exitDate);
      const res = await axios.post("http://127.0.0.1:8000/exit-report", formData);
      if (!res.data.rows?.length) { notify("⚠ No records found for the selected date.", "error"); return; }
      setRows(res.data.rows);
      setCount(res.data.count);
      notify(`✓ ${res.data.count} containers loaded.`);
    } catch (err) {
      notify(err.response?.data?.detail || err.message || "Error generating report.", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (!rows.length) { notify("⚠ No data to export. Generate report first.", "error"); return; }
    const csv = "Container No,Consignee Name,Truck No\n" +
      filtered.map((r) => `${r["Container No"]},${r["Consignee Name"]},${r["Truck No"]}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `EXIT_REPORT_${exitDate}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    notify("✓ CSV exported.");
  };

  const filtered = search
    ? rows.filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))
      )
    : rows;

  return (
    <div className="bg-[#031525] border border-[#0D3A6E] rounded-2xl p-6 shadow-[0_0_40px_rgba(0,239,255,0.05)]">
      <Toast {...toast} />

      <h2 className="text-[#00EFFF] text-lg font-bold tracking-[0.25em] uppercase mb-6 flex items-center gap-2">
        <span className="text-2xl">🚪</span> Exit Report
      </h2>

      {/* File upload */}
      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#0D3A6E] rounded-xl cursor-pointer hover:border-[#00EFFF]/50 hover:bg-[#00EFFF]/5 transition-all duration-300 mb-5 group">
        <span className="text-[#5AA8E0] text-xs tracking-widest group-hover:text-[#00EFFF] transition-colors">
          {file ? `📂 ${file.name}` : "⬆ DROP / CLICK TO SELECT .xlsx / .xls"}
        </span>
        {file && <span className="text-[#38C8FF] text-[10px] mt-1">{(file.size / 1024).toFixed(1)} KB</span>}
        <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => { setFile(e.target.files[0]); setRows([]); setCount(0); }} />
      </label>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end mb-5">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] tracking-widest text-[#5AA8E0] uppercase">Exit Date</label>
          <input
            type="date"
            value={exitDate}
            onChange={(e) => setExitDate(e.target.value)}
            className="bg-[#020D20] border border-[#0D3A6E] text-[#C8E8FF] text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-[#00EFFF] focus:ring-1 focus:ring-[#00EFFF]/30 transition-all"
          />
        </div>
        <button
          onClick={generateReport}
          disabled={loading}
          className="px-4 py-2 text-xs tracking-widest uppercase rounded-lg border border-[#00EFFF] bg-[#003F70] text-[#00EFFF] hover:shadow-[0_0_14px_rgba(0,239,255,0.4)] hover:bg-[#004f88] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <><Spinner /> Processing…</> : "⚡ Generate"}
        </button>
        <button
          onClick={exportExcel}
          disabled={!rows.length}
          className="px-4 py-2 text-xs tracking-widest uppercase rounded-lg border border-[#0D3A6E] bg-[#04182E] text-[#5AA8E0] hover:border-[#38C8FF] hover:text-[#C8E8FF] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ↓ Export CSV
        </button>
      </div>

      {/* Stats + Search */}
      {rows.length > 0 && (
        <div className="flex flex-wrap justify-between items-center mb-4 gap-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#5AA8E0] tracking-widest uppercase">Total Containers:</span>
            <span className="text-[#00EFFF] font-bold text-base">{count}</span>
            {search && filtered.length !== rows.length && (
              <span className="text-[#38C8FF] ml-2">({filtered.length} shown)</span>
            )}
          </div>
          <input
            type="text"
            placeholder="Search containers, consignee, truck…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#020D20] border border-[#0D3A6E] text-[#C8E8FF] text-xs px-3 py-2 rounded-lg w-64 focus:outline-none focus:border-[#00EFFF] focus:ring-1 focus:ring-[#00EFFF]/30 placeholder-[#2a4a6a] transition-all"
          />
        </div>
      )}

      {/* Table */}
      {rows.length > 0 && (
        <div className="overflow-auto max-h-96 rounded-xl border border-[#0D3A6E] animate-fadeIn">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0">
              <tr className="bg-[#021530]">
                {["#", "Container No", "Consignee Name", "Truck No"].map((h) => (
                  <th key={h} className="text-[#00EFFF] tracking-widest uppercase px-4 py-3 border border-[#0D3A6E] text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-[#5AA8E0] tracking-widest">No matching records.</td></tr>
              ) : filtered.map((row, i) => (
                <tr key={i} className={`transition-colors hover:bg-[#00EFFF]/5 ${i % 2 === 0 ? "bg-[#031525]" : "bg-[#04182E]"}`}>
                  <td className="px-4 py-3 border border-[#0D3A6E] text-[#5AA8E0]">{i + 1}</td>
                  <td className="px-4 py-3 border border-[#0D3A6E] text-[#00EFFF] font-bold">{row["Container No"]}</td>
                  <td className="px-4 py-3 border border-[#0D3A6E] text-[#C8E8FF]">{row["Consignee Name"]}</td>
                  <td className="px-4 py-3 border border-[#0D3A6E] text-[#38C8FF]">{row["Truck No"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!rows.length && !loading && (
        <div className="flex flex-col items-center justify-center h-36 rounded-xl border border-dashed border-[#0D3A6E] text-[#2a4a6a] text-xs tracking-widest mt-4">
          <span className="text-3xl mb-2 opacity-30">🚪</span>
          SELECT A FILE AND DATE, THEN GENERATE
        </div>
      )}
    </div>
  );
}
import { useState } from "react";
import api from "../services/api";

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

const TRUCK_REGEX = /^[A-Z0-9]{4,12}$/i;

export default function GmailQuery() {
  const [truck, setTruck]     = useState("");
  const [query, setQuery]     = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [toast, setToast]     = useState({ msg: "", type: "" });

  const notify = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const validate = () => {
    const t = truck.trim();
    if (!t) { notify("⚠ Please enter a truck number.", "error"); return false; }
    if (!TRUCK_REGEX.test(t)) { notify("⚠ Invalid truck number format. Use 4–12 alphanumeric characters.", "error"); return false; }
    return true;
  };

  const generate = async () => {
  if (!validate()) return;

  try {
    setLoading(true);
    setQuery("");

    const res = await api.post("/gmail-query", {
      truck_number: truck.trim().toUpperCase(),
    });

    if (!res.data?.query) {
      notify("⚠ No query returned from server.", "error");
      return;
    }

    const generatedQuery = res.data.query;

    setQuery(generatedQuery);

    try {
      await navigator.clipboard.writeText(
        generatedQuery
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

      notify(
        "✓ Query generated and copied to clipboard."
      );
    } catch (clipboardError) {
      console.error(
        "Clipboard Error:",
        clipboardError
      );

      notify(
        "✓ Query generated. Clipboard access denied.",
        "warning"
      );
    }

  } catch (err) {
    notify(
      err.response?.data?.detail ||
      err.message ||
      "Failed to generate query.",
      "error"
    );
  } finally {
    setLoading(false);
  }
};

  const copyToClipboard = async () => {
  if (!query) {
    notify("⚠ No query to copy.", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(query);

    setCopied(true);

    notify("✓ Copied to clipboard.");

    setTimeout(() => {
      setCopied(false);
    }, 2000);

  } catch {
    notify(
      "⚠ Clipboard access denied. Select and copy manually.",
      "error"
    );
  }
};

  const clearAll = () => {
    setTruck(""); setQuery(""); setCopied(false);
  };

  const charCount = truck.length;
  const isValid = TRUCK_REGEX.test(truck.trim());

  return (
    <div className="bg-[#031525] border border-[#0D3A6E] rounded-2xl p-6 shadow-[0_0_40px_rgba(0,239,255,0.05)] max-w-2xl mx-auto">
      <Toast {...toast} />

      <h2 className="text-[#00EFFF] text-lg font-bold tracking-[0.25em] uppercase mb-6 flex items-center gap-2">
        <span className="text-2xl">✉</span> Gmail Query Generator
      </h2>

      {/* Input */}
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-[10px] tracking-widest text-[#5AA8E0] uppercase">Truck Number</label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. UA244SD"
            value={truck}
            maxLength={12}
            onChange={(e) => setTruck(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            className={`w-full bg-[#020D20] border text-[#C8E8FF] text-sm px-4 py-3 pr-16 rounded-xl focus:outline-none focus:ring-1 transition-all placeholder-[#2a4a6a] tracking-widest
              ${truck && !isValid ? "border-red-500 focus:border-red-400 focus:ring-red-500/20" : "border-[#0D3A6E] focus:border-[#00EFFF] focus:ring-[#00EFFF]/20"}`}
          />
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] ${charCount >= 12 ? "text-red-400" : "text-[#5AA8E0]"}`}>
            {charCount}/12
          </span>
        </div>
        {truck && !isValid && (
          <p className="text-red-400 text-[10px] tracking-widest mt-1">⚠ Must be 4–12 alphanumeric characters.</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={generate}
          disabled={loading || !truck}
          className="flex-1 px-4 py-2 text-xs tracking-widest uppercase rounded-xl border border-[#00EFFF] bg-[#003F70] text-[#00EFFF] hover:shadow-[0_0_16px_rgba(0,239,255,0.35)] hover:bg-[#004f88] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <><Spinner /> Generating…</> : "⚡ Generate Query"}
        </button>
        {(truck || query) && (
          <button
            onClick={clearAll}
            className="px-4 py-2 text-xs tracking-widest uppercase rounded-xl border border-[#0D3A6E] bg-[#04182E] text-[#5AA8E0] hover:border-red-500/50 hover:text-red-400 active:scale-95 transition-all"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Output */}
      <div className="relative">
        <textarea
          value={query}
          readOnly
          rows={8}
          placeholder="Generated Gmail search query will appear here…"
          className="w-full bg-[#020D20] border border-[#0D3A6E] text-[#C8E8FF] text-xs px-4 py-3 rounded-xl resize-none focus:outline-none tracking-wide placeholder-[#2a4a6a] font-mono transition-all"
        />
        {query && (
          <button
            onClick={copyToClipboard}
            className={`absolute top-3 right-3 px-3 py-1 text-[10px] tracking-widest uppercase rounded-lg border transition-all active:scale-95
              ${copied
                ? "border-green-500 bg-green-900/30 text-green-400"
                : "border-[#0D3A6E] bg-[#031525] text-[#5AA8E0] hover:border-[#00EFFF] hover:text-[#00EFFF]"
              }`}
          >
            {copied ? "✓ Copied!" : "⎘ Copy"}
          </button>
        )}
      </div>

      {/* Hint */}
      <p className="text-[10px] text-[#2a4a6a] tracking-widest mt-3 text-center uppercase">
        Press Enter or click Generate · Query auto-copied after generation
      </p>
    </div>
  );
}
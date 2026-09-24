import { useRef, useState } from "react";
import { getToken } from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

type Props = {
  endpoint: string;
  filename: string;
  label?: string;
  templateHeaders?: string[];
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function readError(res: Response, fallback: string) {
  const text = await res.text();
  if (!text) return fallback;
  try {
    const data = JSON.parse(text);
    return data?.error || data?.message || fallback;
  } catch {
    return text.slice(0, 180) || fallback;
  }
}

export function CsvActions({ endpoint, filename, label = "Data", templateHeaders = [] }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function exportCsv() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_URL}${endpoint}/export`, {
        headers: { Authorization: `Bearer ${getToken() || ""}` },
      });
      if (!res.ok) throw new Error(await readError(res, "Export failed"));
      const blob = await res.blob();
      downloadBlob(blob, filename);
      setMessage("Exported successfully");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  function downloadTemplate() {
    setError("");
    setMessage("");
    const csv = `${templateHeaders.join(",")}\r\n`;
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), filename.replace(/\.csv$/i, "-template.csv"));
    setMessage("Template downloaded");
  }

  async function importCsv(file: File) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_URL}${endpoint}/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken() || ""}` },
        body: fd,
      });
      if (!res.ok) throw new Error(await readError(res, "Import failed"));
      const data = await res.json();
      setMessage(data.message || "Imported successfully");
      window.dispatchEvent(new CustomEvent("cms:data-changed"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="csv-actions">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        hidden
        onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])}
      />
      <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => inputRef.current?.click()}>
        Import {label}
      </button>
      <button className="btn btn-ghost" type="button" disabled={busy} onClick={downloadTemplate}>
        Template
      </button>
      <button className="btn btn-ghost" type="button" disabled={busy} onClick={exportCsv}>
        Export {label}
      </button>
      {message && <span className="csv-message success">{message}</span>}
      {error && <span className="csv-message error">{error}</span>}
    </div>
  );
}

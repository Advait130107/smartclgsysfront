
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api, Paginated, uploadUrl } from "@/lib/api";

type Subject = { subject_id: number; sub_name: string };
type Material = {
  material_id: number;
  type: string;
  file_name: string;
  sub_name: string;
};

export default function FacultyMaterialsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rows, setRows] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [subjectId, setSubjectId] = useState("");
  const [type, setType] = useState("notes");
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, s] = await Promise.all([
        api<Paginated<Material>>(`/api/materials?page=${page}&limit=10`),
        api<Paginated<Subject>>("/api/subjects?limit=100"),
      ]);
      setRows(m.data);
      setTotal(m.total);
      setSubjects(s.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append("subject_id", subjectId);
    fd.append("type", type);
    fd.append("file", file);
    try {
      await api("/api/materials", { method: "POST", formData: fd });
      setFile(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await api(`/api/materials/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setDeleteId(null);
    }
  }

  return (
    <AppShell role="faculty">
      <h1>Upload study material</h1>
      <form className="panel row wrap gap-sm" onSubmit={onCreate}>
        <Select
          value={subjectId}
          onChange={setSubjectId}
          placeholder="Subject"
          searchable
          required
          options={subjects.map((s) => ({
            value: String(s.subject_id),
            label: s.sub_name,
          }))}
        />
        <Select
          value={type}
          onChange={setType}
          required
          options={[
            { value: "notes", label: "Notes" },
            { value: "slides", label: "Slides" },
            { value: "reference", label: "Reference" },
          ]}
        />
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
        <button className="btn" type="submit" disabled={!subjectId}>Upload</button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="panel">
        <div className="toolbar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search materials…" />
        </div>
        {loading ? <TableSkeleton /> : (
          <table>
            <thead><tr><th>Subject</th><th>Type</th><th>File</th><th></th></tr></thead>
            <tbody>
              {rows
                .filter((r) => {
                  const q = search.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    r.sub_name.toLowerCase().includes(q) ||
                    r.type.toLowerCase().includes(q) ||
                    r.file_name.toLowerCase().includes(q)
                  );
                })
                .map((r) => (
                <tr key={r.material_id}>
                  <td>{r.sub_name}</td>
                  <td>{r.type}</td>
                  <td><a href={uploadUrl(r.file_name)} target="_blank" rel="noreferrer">{r.file_name}</a></td>
                  <td><button className="btn btn-danger" type="button" onClick={() => setDeleteId(r.material_id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={page} limit={10} total={total} onChange={setPage} />
      </div>
      <ConfirmModal open={deleteId != null} title="Delete material" message="Delete this study material?" confirmLabel="Delete" onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </AppShell>
  );
}

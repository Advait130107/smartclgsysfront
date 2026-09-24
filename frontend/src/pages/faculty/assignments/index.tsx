
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api, Paginated } from "@/lib/api";
import { toUtcDateOnly } from "@/lib/dates";

type Subject = { subject_id: number; sub_name: string };
type Assignment = {
  assign_id: number;
  title: string;
  due_date: string;
  sub_name: string;
};

export default function FacultyAssignmentsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rows, setRows] = useState<Assignment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(toUtcDateOnly());
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, s] = await Promise.all([
        api<Paginated<Assignment>>(`/api/assignments?page=${page}&limit=10`),
        api<Paginated<Subject>>("/api/subjects?limit=100"),
      ]);
      setRows(a.data);
      setTotal(a.total);
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
    try {
      await api("/api/assignments", {
        method: "POST",
        body: JSON.stringify({
          subject_id: Number(subjectId),
          title,
          due_date: dueDate,
        }),
      });
      setTitle("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await api(`/api/assignments/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setDeleteId(null);
    }
  }

  return (
    <AppShell role="faculty">
      <h1>Create assignment</h1>
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
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        <button className="btn" type="submit" disabled={!subjectId}>Create</button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="panel">
        <div className="toolbar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search assignments…" />
        </div>
        {loading ? <TableSkeleton /> : (
          <table>
            <thead><tr><th>Title</th><th>Subject</th><th>Due</th><th></th></tr></thead>
            <tbody>
              {rows
                .filter((r) => {
                  const q = search.trim().toLowerCase();
                  if (!q) return true;
                  return r.title.toLowerCase().includes(q) || r.sub_name.toLowerCase().includes(q);
                })
                .map((r) => (
                <tr key={r.assign_id}>
                  <td>{r.title}</td>
                  <td>{r.sub_name}</td>
                  <td>{r.due_date.slice(0, 10)}</td>
                  <td><button className="btn btn-danger" type="button" onClick={() => setDeleteId(r.assign_id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={page} limit={10} total={total} onChange={setPage} />
      </div>
      <ConfirmModal open={deleteId != null} title="Delete assignment" message="Delete this assignment?" confirmLabel="Delete" onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </AppShell>
  );
}

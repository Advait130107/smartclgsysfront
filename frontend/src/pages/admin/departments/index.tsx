
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { CsvActions } from "@/components/ui/CsvActions";
import { api, Paginated } from "@/lib/api";

type Dept = { dept_id: number; dept_name: string };

export default function AdminDepartmentsPage() {
  const [rows, setRows] = useState<Dept[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = query ? `&q=${encodeURIComponent(query)}` : "";
      const res = await api<Paginated<Dept>>(`/api/departments?page=${page}&limit=10${q}`);
      setRows(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/departments", { method: "POST", body: JSON.stringify({ dept_name: name }) });
      setName("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await api(`/api/departments/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleteId(null);
    }
  }

  return (
    <AppShell role="admin">
      <div className="row between wrap gap-md"><div><h1>Departments</h1><p>Manage departments in bulk with CSV files.</p></div><CsvActions endpoint="/api/departments" filename="departments.csv" label="Departments" templateHeaders={["dept_name"]} /></div>
      <div className="panel">
        <form className="row gap-sm" onSubmit={onCreate}>
          <input placeholder="Department name" value={name} onChange={(e) => setName(e.target.value)} required />
          <button className="btn" type="submit">Add</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="panel">
        <div className="toolbar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search departments…" />
        </div>
        {loading ? <TableSkeleton /> : (
          <table>
            <thead><tr><th>ID</th><th>Name</th><th></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.dept_id}>
                  <td>{r.dept_id}</td>
                  <td>{r.dept_name}</td>
                  <td><button className="btn btn-danger" type="button" onClick={() => setDeleteId(r.dept_id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={page} limit={10} total={total} onChange={setPage} />
      </div>
      <ConfirmModal open={deleteId != null} title="Delete department" message="Delete this department?" confirmLabel="Delete" onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </AppShell>
  );
}

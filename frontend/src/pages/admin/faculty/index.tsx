
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { CsvActions } from "@/components/ui/CsvActions";
import { api, Paginated } from "@/lib/api";

type Faculty = {
  faculty_id: number;
  name: string;
  email: string;
  dept_id: number | null;
  dept_name?: string;
};

type Dept = { dept_id: number; dept_name: string };

export default function AdminFacultyPage() {
  const [rows, setRows] = useState<Faculty[]>([]);
  const [depts, setDepts] = useState<Dept[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deptId, setDeptId] = useState("");
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
      const [f, d] = await Promise.all([
        api<Paginated<Faculty>>(`/api/faculty?page=${page}&limit=10${q}`),
        api<Paginated<Dept>>("/api/departments?limit=100"),
      ]);
      setRows(f.data);
      setTotal(f.total);
      setDepts(d.data);
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
    setError("");
    try {
      await api("/api/faculty", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          dept_id: deptId ? Number(deptId) : null,
        }),
      });
      setName("");
      setEmail("");
      setPassword("");
      setDeptId("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await api(`/api/faculty/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleteId(null);
    }
  }

  return (
    <AppShell role="admin">
      <div className="row between wrap gap-md"><div><h1>Manage faculty</h1><p>Manage faculty accounts and departments.</p></div><CsvActions endpoint="/api/faculty" filename="faculty.csv" label="Faculty" templateHeaders={["name", "email", "password", "dept_id"]} /></div>
      <div className="panel">
        <h3>Add faculty</h3>
        <form className="row wrap gap-sm" onSubmit={onCreate}>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Select
            value={deptId}
            onChange={setDeptId}
            placeholder="Department"
            searchable
            options={depts.map((d) => ({
              value: String(d.dept_id),
              label: d.dept_name,
            }))}
          />
          <button className="btn" type="submit">Add</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="panel">
        <div className="toolbar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search faculty…" />
        </div>
        {loading ? (
          <TableSkeleton />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.faculty_id}>
                    <td>{r.faculty_id}</td>
                    <td>{r.name}</td>
                    <td>{r.email}</td>
                    <td>{r.dept_name || "—"}</td>
                    <td>
                      <button className="btn btn-danger" type="button" onClick={() => setDeleteId(r.faculty_id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} limit={10} total={total} onChange={setPage} />
      </div>
      <ConfirmModal
        open={deleteId != null}
        title="Delete faculty"
        message="This will permanently remove the faculty account."
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </AppShell>
  );
}

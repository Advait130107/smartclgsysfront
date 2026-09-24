
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { CsvActions } from "@/components/ui/CsvActions";
import { api, Paginated } from "@/lib/api";

type Course = {
  course_id: number;
  coursename: string;
  dept_id: number;
  dept_name: string;
  dur_yrs: number;
  seats: number;
  enrolled: number;
};

type Dept = { dept_id: number; dept_name: string };

export default function AdminCoursesPage() {
  const [rows, setRows] = useState<Course[]>([]);
  const [depts, setDepts] = useState<Dept[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coursename, setCoursename] = useState("");
  const [deptId, setDeptId] = useState("");
  const [dur, setDur] = useState("4");
  const [seats, setSeats] = useState("60");
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
      const [c, d] = await Promise.all([
        api<Paginated<Course>>(`/api/courses?page=${page}&limit=10${q}`),
        api<Paginated<Dept>>("/api/departments?limit=100"),
      ]);
      setRows(c.data);
      setTotal(c.total);
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
    try {
      await api("/api/courses", {
        method: "POST",
        body: JSON.stringify({
          coursename,
          dept_id: Number(deptId),
          dur_yrs: Number(dur),
          seats: Number(seats),
        }),
      });
      setCoursename("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await api(`/api/courses/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleteId(null);
    }
  }

  return (
    <AppShell role="admin">
      <div className="row between wrap gap-md"><div><h1>Manage courses</h1><p>Bulk import or export your course catalogue.</p></div><CsvActions endpoint="/api/courses" filename="courses.csv" label="Courses" templateHeaders={["dept_id", "coursename", "dur_yrs", "seats"]} /></div>
      <div className="panel">
        <h3>Add course</h3>
        <form className="row wrap gap-sm" onSubmit={onCreate}>
          <input placeholder="Course name" value={coursename} onChange={(e) => setCoursename(e.target.value)} required />
          <Select
            value={deptId}
            onChange={setDeptId}
            placeholder="Department"
            searchable
            required
            options={depts.map((d) => ({
              value: String(d.dept_id),
              label: d.dept_name,
            }))}
          />
          <input placeholder="Years" value={dur} onChange={(e) => setDur(e.target.value)} />
          <input placeholder="Seats" value={seats} onChange={(e) => setSeats(e.target.value)} />
          <button className="btn" type="submit" disabled={!deptId}>Add</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="panel">
        <div className="toolbar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search courses…" />
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
                  <th>Department</th>
                  <th>Duration</th>
                  <th>Seats</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.course_id}>
                    <td>{r.course_id}</td>
                    <td>{r.coursename}</td>
                    <td>{r.dept_name}</td>
                    <td>{r.dur_yrs}</td>
                    <td>{r.enrolled}/{r.seats}</td>
                    <td>
                      <button className="btn btn-danger" type="button" onClick={() => setDeleteId(r.course_id)}>
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
        title="Delete course"
        message="This will permanently remove the course."
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </AppShell>
  );
}

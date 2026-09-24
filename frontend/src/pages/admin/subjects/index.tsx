
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api, Paginated } from "@/lib/api";

type Subject = {
  subject_id: number;
  sub_name: string;
  course_id: number;
  faculty_id: number | null;
  coursename?: string;
  faculty_name?: string;
};
type Course = { course_id: number; coursename: string };
type Faculty = { faculty_id: number; name: string };

export default function AdminSubjectsPage() {
  const [rows, setRows] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [subName, setSubName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [facultyId, setFacultyId] = useState("");
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
      const [s, c, f] = await Promise.all([
        api<Paginated<Subject>>(`/api/subjects?page=${page}&limit=10${q}`),
        api<Paginated<Course>>("/api/courses?limit=100"),
        api<Paginated<Faculty>>("/api/faculty?limit=100"),
      ]);
      setRows(s.data);
      setTotal(s.total);
      setCourses(c.data);
      setFaculty(f.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => { load(); }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/subjects", {
        method: "POST",
        body: JSON.stringify({
          sub_name: subName,
          course_id: Number(courseId),
          faculty_id: facultyId ? Number(facultyId) : null,
        }),
      });
      setSubName("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await api(`/api/subjects/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleteId(null);
    }
  }

  return (
    <AppShell role="admin">
      <h1>Subjects</h1>
      <div className="panel">
        <form className="row wrap gap-sm" onSubmit={onCreate}>
          <input placeholder="Subject name" value={subName} onChange={(e) => setSubName(e.target.value)} required />
          <Select
            value={courseId}
            onChange={setCourseId}
            placeholder="Course"
            searchable
            required
            options={courses.map((c) => ({
              value: String(c.course_id),
              label: c.coursename,
            }))}
          />
          <Select
            value={facultyId}
            onChange={setFacultyId}
            placeholder="Faculty"
            searchable
            options={faculty.map((f) => ({
              value: String(f.faculty_id),
              label: f.name,
            }))}
          />
          <button className="btn" type="submit" disabled={!courseId}>Add</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="panel">
        <div className="toolbar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search subjects…" />
        </div>
        {loading ? <TableSkeleton /> : (
          <table>
            <thead><tr><th>ID</th><th>Subject</th><th>Course</th><th>Faculty</th><th></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.subject_id}>
                  <td>{r.subject_id}</td>
                  <td>{r.sub_name}</td>
                  <td>{r.coursename}</td>
                  <td>{r.faculty_name || "—"}</td>
                  <td><button className="btn btn-danger" type="button" onClick={() => setDeleteId(r.subject_id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={page} limit={10} total={total} onChange={setPage} />
      </div>
      <ConfirmModal open={deleteId != null} title="Delete subject" message="Delete this subject?" confirmLabel="Delete" onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </AppShell>
  );
}

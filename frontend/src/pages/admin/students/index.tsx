
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { CsvActions } from "@/components/ui/CsvActions";
import { api, Paginated } from "@/lib/api";

type Student = {
  student_id: number;
  stud_name: string;
  email: string;
  course_id: number | null;
  coursename?: string;
  enrollment_status: string;
};

type Course = { course_id: number; coursename: string };

export default function AdminStudentsPage() {
  const [rows, setRows] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [courseId, setCourseId] = useState("");
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
      const [s, c] = await Promise.all([
        api<Paginated<Student>>(`/api/students?page=${page}&limit=10${q}`),
        api<Paginated<Course>>("/api/courses?limit=100"),
      ]);
      setRows(s.data);
      setTotal(s.total);
      setCourses(c.data);
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
      await api("/api/students", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          course_id: courseId ? Number(courseId) : null,
        }),
      });
      setName("");
      setEmail("");
      setPassword("");
      setCourseId("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await api(`/api/students/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleteId(null);
    }
  }

  return (
    <AppShell role="admin">
      <div className="row between wrap gap-md"><div><h1>Manage students</h1><p>Manage student accounts and enrollment status.</p></div><CsvActions endpoint="/api/students" filename="students.csv" label="Students" templateHeaders={["name", "email", "password", "course_id", "enrollment_status"]} /></div>
      <div className="panel">
        <h3>Add student</h3>
        <form className="row wrap gap-sm" onSubmit={onCreate}>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Select
            value={courseId}
            onChange={setCourseId}
            placeholder="Course"
            searchable
            options={courses.map((c) => ({
              value: String(c.course_id),
              label: c.coursename,
            }))}
          />
          <button className="btn" type="submit">Add</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="panel">
        <div className="toolbar">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search students…"
          />
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
                  <th>Course</th>
                  <th>Enrollment</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.student_id}>
                    <td>{r.student_id}</td>
                    <td>{r.stud_name}</td>
                    <td>{r.email}</td>
                    <td>{r.coursename || "—"}</td>
                    <td>{r.enrollment_status}</td>
                    <td>
                      <button className="btn btn-danger" type="button" onClick={() => setDeleteId(r.student_id)}>
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
        title="Delete student"
        message="This will permanently remove the student account."
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </AppShell>
  );
}

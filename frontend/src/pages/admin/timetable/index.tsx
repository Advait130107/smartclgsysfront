
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api, Paginated } from "@/lib/api";

type Row = {
  timetable_id: number;
  day: string;
  time_slot: string;
  sub_name: string;
  coursename: string;
  faculty_name: string;
};
type Subject = { subject_id: number; sub_name: string };
type Course = { course_id: number; coursename: string };
type Faculty = { faculty_id: number; name: string };

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminTimetablePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [subjectId, setSubjectId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [day, setDay] = useState("Monday");
  const [slot, setSlot] = useState("09:00-10:00");
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s, c, f] = await Promise.all([
        api<Paginated<Row>>(`/api/timetable?page=${page}&limit=10`),
        api<Paginated<Subject>>("/api/subjects?limit=100"),
        api<Paginated<Course>>("/api/courses?limit=100"),
        api<Paginated<Faculty>>("/api/faculty?limit=100"),
      ]);
      setRows(t.data);
      setTotal(t.total);
      setSubjects(s.data);
      setCourses(c.data);
      setFaculty(f.data);
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
      await api("/api/timetable", {
        method: "POST",
        body: JSON.stringify({
          subject_id: Number(subjectId),
          faculty_id: Number(facultyId),
          course_id: Number(courseId),
          day,
          time_slot: slot,
        }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await api(`/api/timetable/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleteId(null);
    }
  }

  return (
    <AppShell role="admin">
      <h1>Timetable</h1>
      <div className="panel">
        <form className="row wrap gap-sm" onSubmit={onCreate}>
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
            value={facultyId}
            onChange={setFacultyId}
            placeholder="Faculty"
            searchable
            required
            options={faculty.map((f) => ({
              value: String(f.faculty_id),
              label: f.name,
            }))}
          />
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
            value={day}
            onChange={setDay}
            placeholder="Day"
            required
            options={days.map((d) => ({ value: d, label: d }))}
          />
          <input value={slot} onChange={(e) => setSlot(e.target.value)} />
          <button className="btn" type="submit" disabled={!subjectId || !facultyId || !courseId}>Add</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="panel">
        {loading ? <TableSkeleton /> : (
          <table>
            <thead><tr><th>Day</th><th>Slot</th><th>Subject</th><th>Course</th><th>Faculty</th><th></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.timetable_id}>
                  <td>{r.day}</td>
                  <td>{r.time_slot}</td>
                  <td>{r.sub_name}</td>
                  <td>{r.coursename}</td>
                  <td>{r.faculty_name}</td>
                  <td><button className="btn btn-danger" type="button" onClick={() => setDeleteId(r.timetable_id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={page} limit={10} total={total} onChange={setPage} />
      </div>
      <ConfirmModal open={deleteId != null} title="Delete slot" message="Remove this timetable entry?" confirmLabel="Delete" onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </AppShell>
  );
}

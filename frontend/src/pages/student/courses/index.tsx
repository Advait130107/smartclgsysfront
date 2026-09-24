import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api, Paginated } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Course = { course_id: number; coursename: string; dept_name: string; seats: number; enrolled: number; dur_yrs: number };

export default function StudentCoursesPage() {
  const { user, refreshUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [enrollId, setEnrollId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await api<Paginated<Course>>("/api/courses?limit=100"); setCourses(res.data); await refreshUser(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }, [refreshUser]);

  useEffect(() => { load(); }, [load]);

  async function confirmEnroll() {
    if (!enrollId) return;
    try {
      const res = await api<{ message: string }>(`/api/courses/${enrollId}/enroll`, { method: "POST" });
      setMessage(res.message); setEnrollId(null); await refreshUser(); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed"); setEnrollId(null); }
  }

  const status = user?.enrollment_status || "none";
  const statusLabel = status === "pending" ? "Pending approval" : status === "approved" ? "Enrolled" : status === "rejected" ? "Rejected" : "Not enrolled";

  return <AppShell role="student">
    <div className="page-heading row between wrap gap-md">
      <div><h1>Courses</h1><p>Choose your academic course and track enrollment status.</p></div>
      <span className={`badge ${status}`}>{statusLabel}</span>
    </div>
    {error && <p className="error">{error}</p>}{message && <p className="success">{message}</p>}
    <div className="course-grid">
      {loading ? <TableSkeleton /> : courses.map((c) => {
        const isMine = user?.course_id === c.course_id;
        const full = c.enrolled >= c.seats;
        const enrolledButton = isMine && ["pending", "approved"].includes(status);
        return <article className="panel course-card" key={c.course_id}>
          <div className="course-icon">{c.coursename.slice(0, 2).toUpperCase()}</div>
          <h3>{c.coursename}</h3><p>{c.dept_name}</p>
          <div className="course-meta"><span>{c.dur_yrs} years</span><span>{c.enrolled}/{c.seats} seats</span></div>
          <button className={enrolledButton ? "btn btn-ghost" : "btn"} type="button" disabled={full || enrolledButton} onClick={() => setEnrollId(c.course_id)}>
            {enrolledButton ? (status === "approved" ? "Enrolled" : "Enrolled • Pending") : full ? "No seats" : "Enroll"}
          </button>
        </article>;
      })}
    </div>
    <ConfirmModal open={enrollId != null} title="Enroll in course" message="Submit this enrollment request for admin approval?" confirmLabel="Enroll" onCancel={() => setEnrollId(null)} onConfirm={confirmEnroll} />
  </AppShell>;
}


import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Select } from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api, Paginated } from "@/lib/api";
import { toUtcDateOnly } from "@/lib/dates";

type Subject = { subject_id: number; sub_name: string; course_id: number };
type Student = { student_id: number; stud_name: string };

export default function FacultyAttendancePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(toUtcDateOnly());
  const [statusMap, setStatusMap] = useState<Record<number, "present" | "absent">>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api<Paginated<Subject>>("/api/subjects?limit=100")
      .then((res) => setSubjects(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!subjectId) return;
    const subject = subjects.find((s) => String(s.subject_id) === subjectId);
    if (!subject) return;
    api<Paginated<Student>>(`/api/students?course_id=${subject.course_id}&limit=100`)
      .then((res) => {
        setStudents(res.data);
        const map: Record<number, "present" | "absent"> = {};
        res.data.forEach((s) => {
          map[s.student_id] = "present";
        });
        setStatusMap(map);
      })
      .catch((e) => setError(e.message));
  }, [subjectId, subjects]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await api("/api/attendance", {
        method: "POST",
        body: JSON.stringify({
          subject_id: Number(subjectId),
          date,
          records: Object.entries(statusMap).map(([student_id, status]) => ({
            student_id: Number(student_id),
            status,
          })),
        }),
      });
      setMessage("Attendance saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <AppShell role="faculty">
      <h1>Mark attendance</h1>
      {loading ? <TableSkeleton /> : (
        <form className="panel stack" onSubmit={onSubmit}>
          <div className="row wrap gap-sm">
            <Select
              value={subjectId}
              onChange={setSubjectId}
              placeholder="Select subject"
              searchable
              required
              options={subjects.map((s) => ({
                value: String(s.subject_id),
                label: s.sub_name,
              }))}
            />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          {students.length > 0 && (
            <table className="attendance-table">
              <thead><tr><th>Student</th><th>Status</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.student_id}>
                    <td>{s.stud_name}</td>
                    <td>
                      <div className="attendance-status-toggle" role="group" aria-label={`Attendance status for ${s.stud_name}`}>
                        <button
                          type="button"
                          className={`attendance-status-btn present ${statusMap[s.student_id] === "present" ? "selected" : ""}`}
                          onClick={() => setStatusMap((prev) => ({ ...prev, [s.student_id]: "present" }))}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          className={`attendance-status-btn absent ${statusMap[s.student_id] === "absent" ? "selected" : ""}`}
                          onClick={() => setStatusMap((prev) => ({ ...prev, [s.student_id]: "absent" }))}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}
          <button className="btn" type="submit" disabled={!subjectId || students.length === 0}>
            Save attendance
          </button>
        </form>
      )}
    </AppShell>
  );
}

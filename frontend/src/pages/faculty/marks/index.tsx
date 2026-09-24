
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { CsvActions } from "@/components/ui/CsvActions";
import { api, Paginated } from "@/lib/api";

type Subject = { subject_id: number; sub_name: string; course_id: number };
type Student = { student_id: number; stud_name: string };
type Mark = { mark_id: number; stud_name: string; sub_name: string; score: number; exam_type: string };

export default function FacultyMarksPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [subjectId, setSubjectId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [score, setScore] = useState("");
  const [examType, setExamType] = useState("midterm");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<Paginated<Subject>>("/api/subjects?limit=100")
      .then((res) => setSubjects(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api<Paginated<Mark>>(`/api/marks?page=${page}&limit=10`)
      .then((res) => {
        setMarks(res.data);
        setTotal(res.total);
      })
      .catch((e) => setError(e.message));
  }, [page]);

  useEffect(() => {
    if (!subjectId) return;
    const subject = subjects.find((s) => String(s.subject_id) === subjectId);
    if (!subject) return;
    api<Paginated<Student>>(`/api/students?course_id=${subject.course_id}&limit=100`)
      .then((res) => setStudents(res.data))
      .catch((e) => setError(e.message));
  }, [subjectId, subjects]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await api("/api/marks", {
        method: "POST",
        body: JSON.stringify({
          subject_id: Number(subjectId),
          student_id: Number(studentId),
          score: Number(score),
          exam_type: examType,
        }),
      });
      setMessage("Marks saved");
      setScore("");
      const res = await api<Paginated<Mark>>(`/api/marks?page=${page}&limit=10`);
      setMarks(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  const filteredMarks = marks.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      m.stud_name.toLowerCase().includes(q) ||
      m.sub_name.toLowerCase().includes(q) ||
      m.exam_type.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell role="faculty">
      <div className="row between wrap gap-md"><div><h1>Enter marks</h1><p>Enter marks manually or import them in bulk.</p></div><CsvActions endpoint="/api/marks" filename="marks.csv" label="Marks" templateHeaders={["student_id", "subject_id", "score", "exam_type"]} /></div>
      {loading ? <TableSkeleton /> : (
        <form className="panel row wrap gap-sm" onSubmit={onSubmit}>
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
            value={studentId}
            onChange={setStudentId}
            placeholder="Student"
            searchable
            required
            options={students.map((s) => ({
              value: String(s.student_id),
              label: s.stud_name,
            }))}
          />
          <input placeholder="Score" value={score} onChange={(e) => setScore(e.target.value)} required />
          <Select
            value={examType}
            onChange={setExamType}
            required
            options={[
              { value: "midterm", label: "Midterm" },
              { value: "final", label: "Final" },
              { value: "quiz", label: "Quiz" },
            ]}
          />
          <button className="btn" type="submit" disabled={!subjectId || !studentId}>Save</button>
        </form>
      )}
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <div className="panel">
        <div className="toolbar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search marks…" />
        </div>
        <table>
          <thead><tr><th>Student</th><th>Subject</th><th>Exam</th><th>Score</th></tr></thead>
          <tbody>
            {filteredMarks.map((m) => (
              <tr key={m.mark_id}>
                <td>{m.stud_name}</td>
                <td>{m.sub_name}</td>
                <td>{m.exam_type}</td>
                <td>{m.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} limit={10} total={total} onChange={setPage} />
      </div>
    </AppShell>
  );
}

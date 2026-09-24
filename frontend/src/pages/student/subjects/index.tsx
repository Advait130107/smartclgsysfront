import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api, Paginated } from "@/lib/api";

type Subject = { subject_id: number; sub_name: string; coursename?: string };
type Att = { att_id:number; date:string; status:string };
type Mark = { mark_id:number; score:number; exam_type:string };

export default function StudentSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [detail, setDetail] = useState<"attendance" | "marks">("attendance");
  const [attendance, setAttendance] = useState<Att[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([api<Paginated<Subject>>("/api/subjects?limit=100"), api<{data:Subject[]}>("/api/students/me/subjects")])
      .then(([all, mine]) => { setSubjects(all.data); setSelected(mine.data.map(s => s.subject_id)); })
      .catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  async function openDetails(id:number, type:"attendance"|"marks") {
    setOpen(id); setDetail(type); setDetailLoading(true); setError("");
    try {
      if (type === "attendance") setAttendance((await api<Paginated<Att>>(`/api/attendance?subject_id=${id}&limit=100`)).data);
      else setMarks((await api<Paginated<Mark>>(`/api/marks?subject_id=${id}&limit=100`)).data);
    } catch(e) { setError(e instanceof Error ? e.message : "Failed to load details"); }
    finally { setDetailLoading(false); }
  }

  async function saveSubjects() {
    try { await api("/api/students/me/subjects", { method:"POST", body:JSON.stringify({subject_ids:selected}) }); setMessage("Subjects saved"); }
    catch(e) { setError(e instanceof Error ? e.message : "Failed"); }
  }

  return <AppShell role="student">
    <div><h1>My subjects</h1><p>Open a subject to see its attendance or marks.</p></div>
    {error && <p className="error">{error}</p>}{message && <p className="success">{message}</p>}
    {loading ? <TableSkeleton /> : <>
      <div className="subject-grid">
        {subjects.map(s => <article key={s.subject_id} className={`subject-card ${open===s.subject_id ? "open" : ""}`}>
          <div className="subject-icon">◈</div><h3>{s.sub_name}</h3><p>{s.coursename || "Your enrolled subject"}</p>
          <div className="detail-actions">
            <button className="btn btn-ghost" type="button" onClick={() => openDetails(s.subject_id,"attendance")}>Attendance</button>
            <button className="btn btn-ghost" type="button" onClick={() => openDetails(s.subject_id,"marks")}>Marks</button>
          </div>
          {open===s.subject_id && <div className="subject-detail">
            <strong>{detail === "attendance" ? "Attendance details" : "Marks details"}</strong>
            {detailLoading ? <p>Loading…</p> : detail === "attendance" ? <table className="detail-table"><thead><tr><th>Date</th><th>Status</th></tr></thead><tbody>{attendance.map(a=><tr key={a.att_id}><td>{a.date}</td><td><span className={`badge ${a.status}`}>{a.status}</span></td></tr>)}{!attendance.length&&<tr><td colSpan={2}>No attendance recorded.</td></tr>}</tbody></table> : <table className="detail-table"><thead><tr><th>Exam</th><th>Score</th></tr></thead><tbody>{marks.map(m=><tr key={m.mark_id}><td>{m.exam_type}</td><td>{m.score}</td></tr>)}{!marks.length&&<tr><td colSpan={2}>No marks recorded.</td></tr>}</tbody></table>}
          </div>}
        </article>)}
      </div>
      <div className="panel" style={{marginTop:"1rem"}}><div className="row between wrap gap-sm"><div><strong>Subject selection</strong><p className="muted">Selected: {selected.length}</p></div><button className="btn" type="button" onClick={saveSubjects}>Save subjects</button></div><div className="subject-checks">{subjects.map(s=><label key={s.subject_id} className="check-card"><input type="checkbox" checked={selected.includes(s.subject_id)} onChange={()=>setSelected(prev=>prev.includes(s.subject_id)?prev.filter(id=>id!==s.subject_id):[...prev,s.subject_id])}/><span>{s.sub_name}</span></label>)}</div></div>
    </>}
  </AppShell>;
}

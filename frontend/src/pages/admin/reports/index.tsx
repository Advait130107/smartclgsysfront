
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BarChart, ChartLegend, DonutChart } from "@/components/ui/Charts";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { api, Paginated } from "@/lib/api";
import { formatUtc } from "@/lib/dates";

type Summary = {
  students: number;
  faculty: number;
  courses: number;
  departments: number;
  pendingEnrollments: number;
  approvedEnrollments: number;
  rejectedEnrollments: number;
  attendancePresent: number;
  attendanceAbsent: number;
  avgMarks: number;
  studentsByCourse: { label: string; value: number }[];
  marksByExam: { label: string; value: number }[];
};

type Audit = {
  audit_id: number;
  action: string;
  entity: string;
  entity_id: string;
  created_at: string;
};

export default function AdminReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api<Summary>("/api/reports/summary")
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    api<Paginated<Audit>>(`/api/notifications/audit?page=${page}&limit=10`)
      .then((res) => {
        setAudits(res.data);
        setTotal(res.total);
      })
      .catch((e) => setError(e.message));
  }, [page]);

  const attendanceSlices = summary
    ? [
        { label: "Present", value: summary.attendancePresent, color: "#1f6b4a" },
        { label: "Absent", value: summary.attendanceAbsent, color: "#c9842b" },
      ]
    : [];

  const filteredAudits = audits.filter((a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      a.action.toLowerCase().includes(q) ||
      a.entity.toLowerCase().includes(q) ||
      String(a.entity_id).toLowerCase().includes(q)
    );
  });

  return (
    <AppShell role="admin">
      <h1>Generate reports</h1>
      {error && <p className="error">{error}</p>}
      {!summary ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="kpi-row">
            <div className="kpi">
              <span className="kpi-label">Students</span>
              <strong>{summary.students}</strong>
            </div>
            <div className="kpi">
              <span className="kpi-label">Faculty</span>
              <strong>{summary.faculty}</strong>
            </div>
            <div className="kpi">
              <span className="kpi-label">Present</span>
              <strong>{summary.attendancePresent}</strong>
            </div>
            <div className="kpi">
              <span className="kpi-label">Avg marks</span>
              <strong>{summary.avgMarks}</strong>
            </div>
          </div>
          <div className="dashboard-grid">
            <div className="panel chart-panel">
              <h3>Attendance</h3>
              <div className="chart-panel-body">
                <DonutChart
                  slices={attendanceSlices}
                  centerValue={summary.attendancePresent + summary.attendanceAbsent}
                  centerLabel="records"
                />
                <ChartLegend items={attendanceSlices} />
              </div>
            </div>
            <div className="panel chart-panel">
              <h3>Students by course</h3>
              <BarChart items={summary.studentsByCourse} />
            </div>
          </div>
        </>
      )}
      <div className="panel">
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Audit trail</h3>
          <SearchBar value={search} onChange={setSearch} placeholder="Search audit…" />
        </div>
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th>Entity</th>
              <th>ID</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {filteredAudits.map((a) => (
              <tr key={a.audit_id}>
                <td>{a.action}</td>
                <td>{a.entity}</td>
                <td>{a.entity_id}</td>
                <td>{formatUtc(a.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} limit={10} total={total} onChange={setPage} />
      </div>
    </AppShell>
  );
}

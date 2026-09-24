
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BarChart, ChartLegend, DonutChart } from "@/components/ui/Charts";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Summary = {
  subjects: number;
  assignments: number;
  materials: number;
  present: number;
  absent: number;
  avgMarks: number;
  attendanceBySubject: { label: string; present: number; absent: number }[];
};

export default function FacultyHome() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Summary>("/api/reports/faculty-summary")
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, []);

  const attendanceSlices = summary
    ? [
        { label: "Present", value: summary.present, color: "#1f6b4a" },
        { label: "Absent", value: summary.absent, color: "#c9842b" },
      ]
    : [];
  const totalAtt = (summary?.present || 0) + (summary?.absent || 0);
  const rate = totalAtt > 0 ? Math.round(((summary?.present || 0) / totalAtt) * 100) : 0;

  return (
    <AppShell role="faculty">
      <h1>Faculty dashboard</h1>
      <p>Welcome {user?.name}. Track your teaching load, attendance, and grading at a glance.</p>
      {error && <p className="error">{error}</p>}
      {!summary ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="kpi-row">
            <div className="kpi">
              <span className="kpi-label">Subjects</span>
              <strong>{summary.subjects}</strong>
            </div>
            <div className="kpi">
              <span className="kpi-label">Assignments</span>
              <strong>{summary.assignments}</strong>
            </div>
            <div className="kpi">
              <span className="kpi-label">Materials</span>
              <strong>{summary.materials}</strong>
            </div>
            <div className="kpi">
              <span className="kpi-label">Avg marks</span>
              <strong>{summary.avgMarks}</strong>
              <div className="kpi-meta">{rate}% present</div>
            </div>
          </div>
          <div className="dashboard-grid">
            <div className="panel chart-panel">
              <h3>Attendance overview</h3>
              <div className="chart-panel-body">
                <DonutChart
                  slices={attendanceSlices}
                  centerValue={`${rate}%`}
                  centerLabel="present"
                />
                <ChartLegend items={attendanceSlices} />
              </div>
            </div>
            <div className="panel chart-panel">
              <h3>Present by subject</h3>
              {summary.attendanceBySubject.length === 0 ? (
                <p className="muted">No subject data yet.</p>
              ) : (
                <BarChart
                  items={summary.attendanceBySubject.map((s) => ({
                    label: s.label,
                    value: s.present,
                    color: "#1f6b4a",
                  }))}
                />
              )}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

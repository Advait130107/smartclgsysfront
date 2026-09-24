
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BarChart, ChartLegend, DonutChart } from "@/components/ui/Charts";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Summary = {
  subjects: number;
  present: number;
  absent: number;
  assignments: number;
  submissions: number;
  avgMarks: number;
  marksByExam: { label: string; value: number }[];
  enrollment_status: string;
};

export default function StudentHome() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Summary>("/api/reports/student-summary")
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
    <AppShell role="student">
      <h1>Student dashboard</h1>
      <p>
        Welcome {user?.name}. Enrollment:{" "}
        <strong>{summary?.enrollment_status || user?.enrollment_status || "none"}</strong>
      </p>
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
              <span className="kpi-label">Attendance</span>
              <strong>{rate}%</strong>
              <div className="kpi-meta">
                {summary.present} present · {summary.absent} absent
              </div>
            </div>
            <div className="kpi">
              <span className="kpi-label">Assignments</span>
              <strong>{summary.assignments}</strong>
              <div className="kpi-meta">{summary.submissions} submitted</div>
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
                  centerValue={`${rate}%`}
                  centerLabel="present"
                />
                <ChartLegend items={attendanceSlices} />
              </div>
            </div>
            <div className="panel chart-panel">
              <h3>Marks by exam</h3>
              {summary.marksByExam.length === 0 ? (
                <p className="muted">No marks yet.</p>
              ) : (
                <BarChart
                  items={summary.marksByExam.map((item, i) => ({
                    ...item,
                    color: ["#145238", "#1f6b4a", "#2d8a62", "#c9842b"][i % 4],
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

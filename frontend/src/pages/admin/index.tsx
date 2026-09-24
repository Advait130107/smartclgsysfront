
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BarChart, ChartLegend, DonutChart } from "@/components/ui/Charts";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";

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

export default function AdminHome() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Summary>("/api/reports/summary")
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, []);

  const attendanceSlices = summary
    ? [
        { label: "Present", value: summary.attendancePresent, color: "#1f6b4a" },
        { label: "Absent", value: summary.attendanceAbsent, color: "#c9842b" },
      ]
    : [];

  const enrollmentSlices = summary
    ? [
        { label: "Approved", value: summary.approvedEnrollments, color: "#1f6b4a" },
        { label: "Pending", value: summary.pendingEnrollments, color: "#c9842b" },
        { label: "Rejected", value: summary.rejectedEnrollments, color: "#a33b2d" },
      ]
    : [];

  const attendanceTotal =
    (summary?.attendancePresent || 0) + (summary?.attendanceAbsent || 0);
  const attendanceRate =
    attendanceTotal > 0
      ? Math.round(((summary?.attendancePresent || 0) / attendanceTotal) * 100)
      : 0;

  return (
    <AppShell role="admin">
      <h1>Admin overview</h1>
      <p>Live KPIs across people, enrollments, attendance, and assessments.</p>
      {error && <p className="error">{error}</p>}
      {!summary ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="kpi-row">
            <div className="kpi">
              <span className="kpi-label">Students</span>
              <strong>{summary.students}</strong>
              <div className="kpi-meta">{summary.pendingEnrollments} pending</div>
            </div>
            <div className="kpi">
              <span className="kpi-label">Faculty</span>
              <strong>{summary.faculty}</strong>
              <div className="kpi-meta">{summary.departments} departments</div>
            </div>
            <div className="kpi">
              <span className="kpi-label">Courses</span>
              <strong>{summary.courses}</strong>
              <div className="kpi-meta">Across campus</div>
            </div>
            <div className="kpi">
              <span className="kpi-label">Avg marks</span>
              <strong>{summary.avgMarks}</strong>
              <div className="kpi-meta">{attendanceRate}% present rate</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="panel chart-panel">
              <h3>Attendance mix</h3>
              <div className="chart-panel-body">
                <DonutChart
                  slices={attendanceSlices}
                  centerValue={`${attendanceRate}%`}
                  centerLabel="present"
                />
                <ChartLegend items={attendanceSlices} />
              </div>
            </div>
            <div className="panel chart-panel">
              <h3>Enrollment status</h3>
              <div className="chart-panel-body">
                <DonutChart
                  slices={enrollmentSlices}
                  centerValue={summary.students}
                  centerLabel="total"
                />
                <ChartLegend items={enrollmentSlices} />
              </div>
            </div>
            <div className="panel chart-panel">
              <h3>Students by course</h3>
              <BarChart
                items={summary.studentsByCourse.map((item, i) => ({
                  ...item,
                  color: ["#1f6b4a", "#2d8a62", "#3fa577", "#6bb892", "#96c9ae", "#c4ddd0"][i % 6],
                }))}
              />
            </div>
            <div className="panel chart-panel">
              <h3>Average marks by exam</h3>
              {summary.marksByExam.length === 0 ? (
                <p className="muted">No marks recorded yet.</p>
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

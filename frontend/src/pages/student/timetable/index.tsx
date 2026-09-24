
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Select } from "@/components/ui/Select";
import { api, Paginated } from "@/lib/api";

type Row = {
  timetable_id: number;
  day: string;
  time_slot: string;
  sub_name: string;
  faculty_name: string;
};

export default function StudentTimetablePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [day, setDay] = useState("All");

  useEffect(() => {
    api<Paginated<Row>>("/api/timetable?limit=50")
      .then((res) => setRows(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = day === "All" ? rows : rows.filter((r) => r.day === day);

  return (
    <AppShell role="student">
      <h1>View timetable</h1>
      <p>Select a weekday to see only that day&apos;s schedule.</p>
      <div className="day-select"><Select value={day} onChange={setDay} placeholder="Select weekday" options={["All","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d) => ({ value:d, label:d === "All" ? "All days" : d }))} /></div>
      {error && <p className="error">{error}</p>}
      <div className="panel">
        {loading ? <TableSkeleton /> : (<>
          <table>
            <thead><tr><th>Day</th><th>Slot</th><th>Subject</th><th>Faculty</th></tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.timetable_id}>
                  <td>{r.day}</td><td>{r.time_slot}</td><td>{r.sub_name}</td><td>{r.faculty_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <p className="muted">No timetable entries for this day.</p>}
        </>)}
      </div>
    </AppShell>
  );
}

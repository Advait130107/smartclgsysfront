
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api, Paginated } from "@/lib/api";
import { formatUtc } from "@/lib/dates";

type Feedback = {
  feedback_id: number;
  stud_name: string;
  message: string;
  created_at: string;
};

export default function AdminFeedbackPage() {
  const [rows, setRows] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<Paginated<Feedback>>(`/api/feedback?page=${page}&limit=10`);
      setRows(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <AppShell role="admin">
      <h1>View feedback</h1>
      {error && <p className="error">{error}</p>}
      <div className="panel">
        {loading ? <TableSkeleton /> : (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Message</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.feedback_id}>
                  <td>{r.stud_name}</td>
                  <td style={{ whiteSpace: "normal" }}>{r.message}</td>
                  <td>{formatUtc(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={page} limit={10} total={total} onChange={setPage} />
      </div>
    </AppShell>
  );
}

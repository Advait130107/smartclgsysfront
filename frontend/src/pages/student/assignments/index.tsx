
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api, Paginated } from "@/lib/api";

type Assignment = {
  assign_id: number;
  title: string;
  due_date: string;
  sub_name: string;
  submission?: { status: string; file_name: string } | null;
};

export default function StudentAssignmentsPage() {
  const [rows, setRows] = useState<Assignment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<Record<number, File | null>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<Paginated<Assignment>>(`/api/assignments?page=${page}&limit=10`);
      setRows(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function submitOne(e: FormEvent, assignId: number) {
    e.preventDefault();
    const file = files[assignId];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setMessage("");
    setError("");
    try {
      const res = await api<{ message: string }>(`/api/assignments/${assignId}/submit`, {
        method: "POST",
        formData: fd,
      });
      setMessage(res.message);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <AppShell role="student">
      <h1>Submit assignment</h1>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <div className="panel">
        {loading ? <TableSkeleton /> : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Due</th>
                <th>Status</th>
                <th>Upload</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.assign_id}>
                  <td>{r.title}</td>
                  <td>{r.sub_name}</td>
                  <td>{r.due_date.slice(0, 10)}</td>
                  <td>{r.submission?.status || "pending"}</td>
                  <td>
                    {r.submission?.status === "submitted" ? (
                      <button className="btn btn-ghost" type="button" disabled>Submitted ✓</button>
                    ) : (
                      <form className="row gap-sm" onSubmit={(e) => submitOne(e, r.assign_id)}>
                        <input type="file" onChange={(e) => setFiles((prev) => ({ ...prev, [r.assign_id]: e.target.files?.[0] || null }))} required />
                        <button className="btn" type="submit">Submit</button>
                      </form>
                    )}
                  </td>
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


import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api, Paginated } from "@/lib/api";

type Student = {
  student_id: number;
  stud_name: string;
  email: string;
  coursename?: string;
  enrollment_status: string;
};

export default function AdminEnrollmentsPage() {
  const [rows, setRows] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState<{ id: number; status: "approved" | "rejected" } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = query ? `&q=${encodeURIComponent(query)}` : "";
      const res = await api<Paginated<Student>>(`/api/students?page=${page}&limit=10${q}`);
      setRows(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => { load(); }, [load]);

  async function confirmAction() {
    if (!action) return;
    try {
      await api(`/api/students/${action.id}/enrollment`, {
        method: "PATCH",
        body: JSON.stringify({ status: action.status }),
      });
      setAction(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setAction(null);
    }
  }

  return (
    <AppShell role="admin">
      <h1>Approve / reject enrollment</h1>
      {error && <p className="error">{error}</p>}
      <div className="panel">
        <div className="toolbar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search enrollments…" />
        </div>
        {loading ? <TableSkeleton /> : (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Course</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.student_id}>
                  <td>{r.stud_name}</td>
                  <td>{r.email}</td>
                  <td>{r.coursename || "—"}</td>
                  <td>{r.enrollment_status}</td>
                  <td>
                    {r.enrollment_status === "pending" && (
                      <div className="row gap-sm">
                        <button className="btn" type="button" onClick={() => setAction({ id: r.student_id, status: "approved" })}>Approve</button>
                        <button className="btn btn-danger" type="button" onClick={() => setAction({ id: r.student_id, status: "rejected" })}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={page} limit={10} total={total} onChange={setPage} />
      </div>
      <ConfirmModal
        open={action != null}
        title={`${action?.status === "approved" ? "Approve" : "Reject"} enrollment`}
        message={`Confirm ${action?.status} for this student?`}
        confirmLabel="Confirm"
        onCancel={() => setAction(null)}
        onConfirm={confirmAction}
      />
    </AppShell>
  );
}

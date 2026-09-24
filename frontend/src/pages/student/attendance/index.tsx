
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api, Paginated } from "@/lib/api";

type Row = {
  att_id: number;
  date: string;
  status: string;
  sub_name: string;
};

export default function StudentAttendancePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api<Paginated<Row>>(`/api/attendance?page=${page}&limit=10`)
      .then((res) => {
        setRows(res.data);
        setTotal(res.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      r.sub_name.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      r.date.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell role="student">
      <h1>View attendance</h1>
      {error && <p className="error">{error}</p>}
      <div className="panel">
        <div className="toolbar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search attendance…" />
        </div>
        {loading ? <TableSkeleton /> : (
          <table>
            <thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.att_id}>
                  <td>{r.date}</td>
                  <td>{r.sub_name}</td>
                  <td>{r.status}</td>
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

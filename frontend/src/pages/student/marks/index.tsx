
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api, Paginated } from "@/lib/api";

type Row = {
  mark_id: number;
  score: number;
  exam_type: string;
  sub_name: string;
};

export default function StudentMarksPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api<Paginated<Row>>(`/api/marks?page=${page}&limit=10`)
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
      r.exam_type.toLowerCase().includes(q) ||
      String(r.score).includes(q)
    );
  });

  return (
    <AppShell role="student">
      <h1>View marks</h1>
      {error && <p className="error">{error}</p>}
      <div className="panel">
        <div className="toolbar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search marks…" />
        </div>
        {loading ? <TableSkeleton /> : (
          <table>
            <thead><tr><th>Subject</th><th>Exam</th><th>Score</th></tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.mark_id}>
                  <td>{r.sub_name}</td>
                  <td>{r.exam_type}</td>
                  <td>{r.score}</td>
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

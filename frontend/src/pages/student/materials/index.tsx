
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api, Paginated, uploadUrl } from "@/lib/api";

type Row = {
  material_id: number;
  type: string;
  file_name: string;
  sub_name: string;
  faculty_name: string;
};

export default function StudentMaterialsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api<Paginated<Row>>(`/api/materials?page=${page}&limit=10`)
      .then((res) => {
        setRows(res.data);
        setTotal(res.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <AppShell role="student">
      <h1>Study materials</h1>
      {error && <p className="error">{error}</p>}
      <div className="panel">
        {loading ? <TableSkeleton /> : (
          <table>
            <thead><tr><th>Subject</th><th>Type</th><th>Faculty</th><th>File</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.material_id}>
                  <td>{r.sub_name}</td>
                  <td>{r.type}</td>
                  <td>{r.faculty_name}</td>
                  <td>
                    <a className="material-link" href={uploadUrl(r.file_name)} target="_blank" rel="noreferrer">
                      {r.file_name}
                    </a>
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


type Props = {
  page: number;
  limit: number;
  total: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, limit, total, onChange }: Props) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div className="row gap-sm pagination">
      <button
        type="button"
        className="btn btn-ghost"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>
      <span>
        Page {page} of {pages}
      </span>
      <button
        type="button"
        className="btn btn-ghost"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

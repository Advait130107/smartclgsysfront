type Slice = { label: string; value: number; color: string };

export function DonutChart({
  slices,
  size = 160,
  thickness = 22,
  centerLabel,
  centerValue,
}: {
  slices: Slice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
}) {
  const total = slices.reduce((s, x) => s + Math.max(0, x.value), 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="chart-donut">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e4ebe6"
          strokeWidth={thickness}
        />
        {slices.map((slice) => {
          const len = (Math.max(0, slice.value) / total) * c;
          const el = (
            <circle
              key={slice.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="chart-donut-center">
        {centerValue != null && <strong>{centerValue}</strong>}
        {centerLabel && <span>{centerLabel}</span>}
      </div>
    </div>
  );
}

export function BarChart({
  items,
  height = 180,
}: {
  items: { label: string; value: number; color?: string }[];
  height?: number;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="chart-bars" style={{ height }}>
      {items.map((item) => {
        const pct = Math.round((item.value / max) * 100);
        return (
          <div key={item.label} className="chart-bar-col">
            <div className="chart-bar-track">
              <div
                className="chart-bar-fill"
                style={{
                  height: `${pct}%`,
                  background: item.color || "var(--brand)",
                }}
                title={`${item.label}: ${item.value}`}
              />
            </div>
            <span className="chart-bar-value">{item.value}</span>
            <span className="chart-bar-label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ChartLegend({ items }: { items: Slice[] }) {
  return (
    <ul className="chart-legend">
      {items.map((item) => (
        <li key={item.label}>
          <span style={{ background: item.color }} />
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </li>
      ))}
    </ul>
  );
}

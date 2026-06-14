"use client";

import { formatTime, formatValue } from "@/lib/format";

type Point = { measured_at: string; value: number };

type Props = {
  points: Point[];
  normalMin: number;
  normalMax: number;
  unit: string;
};

const WIDTH = 800;
const HEIGHT = 300;
const PAD = { top: 28, right: 64, bottom: 40, left: 52 };

function isOutOfRange(value: number, min: number, max: number) {
  return value < min || value > max;
}

function buildBreachRanges(points: Point[], min: number, max: number) {
  const ranges: Array<{ from: string; to: string; count: number; peak: number }> = [];
  let current: { start: Point; end: Point; count: number; peak: number } | null = null;

  for (const point of points) {
    if (isOutOfRange(point.value, min, max)) {
      if (!current) {
        current = { start: point, end: point, count: 1, peak: point.value };
      } else {
        current.end = point;
        current.count += 1;
        if (Math.abs(point.value - (min + max) / 2) > Math.abs(current.peak - (min + max) / 2)) {
          current.peak = point.value;
        }
      }
    } else if (current) {
      ranges.push({
        from: current.start.measured_at,
        to: current.end.measured_at,
        count: current.count,
        peak: current.peak,
      });
      current = null;
    }
  }

  if (current) {
    ranges.push({
      from: current.start.measured_at,
      to: current.end.measured_at,
      count: current.count,
      peak: current.peak,
    });
  }

  return ranges;
}

export function ZoneHistoryChart({ points, normalMin, normalMax, unit }: Props) {
  if (points.length === 0) {
    return <p className="text-sm text-stone-500">Pas encore de mesures pour ce capteur.</p>;
  }

  const chartW = WIDTH - PAD.left - PAD.right;
  const chartH = HEIGHT - PAD.top - PAD.bottom;
  const values = points.map((p) => p.value);
  const dataMin = Math.min(...values, normalMin);
  const dataMax = Math.max(...values, normalMax);
  const padding = Math.max((dataMax - dataMin) * 0.12, 0.5);
  const yMin = dataMin - padding;
  const yMax = dataMax + padding;

  const xScale = (index: number) =>
    PAD.left + (index / Math.max(points.length - 1, 1)) * chartW;
  const yScale = (value: number) =>
    PAD.top + chartH - ((value - yMin) / (yMax - yMin)) * chartH;

  const minLineY = yScale(normalMin);
  const maxLineY = yScale(normalMax);
  const breachRanges = buildBreachRanges(points, normalMin, normalMax);
  const breachCount = points.filter((p) => isOutOfRange(p.value, normalMin, normalMax)).length;

  const segments: Array<{ d: string; out: boolean }> = [];
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    segments.push({
      d: `M ${xScale(i - 1)} ${yScale(prev.value)} L ${xScale(i)} ${yScale(curr.value)}`,
      out:
        isOutOfRange(prev.value, normalMin, normalMax) ||
        isOutOfRange(curr.value, normalMin, normalMax),
    });
  }

  const yTicks = 5;
  const tickValues = Array.from({ length: yTicks }, (_, i) => yMin + ((yMax - yMin) * i) / (yTicks - 1));

  const xLabelIndices = [
    0,
    Math.floor(points.length / 2),
    points.length - 1,
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-stone-100 bg-stone-50/50 p-2">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full min-w-[520px]"
          role="img"
          aria-label="Évolution des mesures avec seuils"
        >
          <rect
            x={PAD.left}
            y={maxLineY}
            width={chartW}
            height={minLineY - maxLineY}
            fill="#d1fae5"
            opacity={0.55}
          />
          <rect
            x={PAD.left}
            y={PAD.top}
            width={chartW}
            height={maxLineY - PAD.top}
            fill="#fee2e2"
            opacity={0.35}
          />
          <rect
            x={PAD.left}
            y={minLineY}
            width={chartW}
            height={PAD.top + chartH - minLineY}
            fill="#fee2e2"
            opacity={0.35}
          />

          {tickValues.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={yScale(tick)}
                x2={PAD.left + chartW}
                y2={yScale(tick)}
                stroke="#e7e5e4"
                strokeDasharray="4 4"
              />
              <text
                x={PAD.left - 8}
                y={yScale(tick) + 4}
                textAnchor="end"
                className="fill-stone-500 text-[11px]"
              >
                {tick.toFixed(unit === "percent" ? 0 : 1)}
              </text>
            </g>
          ))}

          <line
            x1={PAD.left}
            y1={maxLineY}
            x2={PAD.left + chartW}
            y2={maxLineY}
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />
          <line
            x1={PAD.left}
            y1={minLineY}
            x2={PAD.left + chartW}
            y2={minLineY}
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />

          <text
            x={PAD.left + chartW + 6}
            y={maxLineY + 4}
            className="fill-amber-700 text-[11px] font-medium"
          >
            max {formatValue(normalMax, unit)}
          </text>
          <text
            x={PAD.left + chartW + 6}
            y={minLineY + 4}
            className="fill-amber-700 text-[11px] font-medium"
          >
            min {formatValue(normalMin, unit)}
          </text>

          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.d}
              fill="none"
              stroke={segment.out ? "#dc2626" : "#059669"}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {points.map((point, index) => (
            <circle
              key={`${point.measured_at}-${index}`}
              cx={xScale(index)}
              cy={yScale(point.value)}
              r={points.length > 80 ? 2.5 : 4}
              fill={isOutOfRange(point.value, normalMin, normalMax) ? "#dc2626" : "#059669"}
              stroke="white"
              strokeWidth={1}
            />
          ))}

          {xLabelIndices.map((index) => (
            <text
              key={index}
              x={xScale(index)}
              y={HEIGHT - 10}
              textAnchor="middle"
              className="fill-stone-500 text-[11px]"
            >
              {formatTime(points[index].measured_at)}
            </text>
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-stone-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-6 rounded-sm bg-emerald-100 ring-1 ring-emerald-200" />
          Zone normale
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-6 border-t-2 border-dashed border-amber-500" />
          Seuils min / max
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-6 rounded-sm bg-red-100 ring-1 ring-red-200" />
          Hors seuil
        </span>
        <span>
          {breachCount} mesure{breachCount > 1 ? "s" : ""} hors seuil sur {points.length}
        </span>
      </div>

      {breachRanges.length > 0 && (
        <div className="rounded-lg border border-red-100 bg-red-50/60 p-4">
          <p className="text-sm font-medium text-red-900">Périodes de dépassement</p>
          <ul className="mt-2 space-y-1.5 text-sm text-red-800">
            {breachRanges.map((range, index) => (
              <li key={index}>
                {formatTime(range.from)}
                {range.from !== range.to && ` → ${formatTime(range.to)}`}
                {" · "}
                {range.count} mesure{range.count > 1 ? "s" : ""}, pic{" "}
                {formatValue(range.peak, unit)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

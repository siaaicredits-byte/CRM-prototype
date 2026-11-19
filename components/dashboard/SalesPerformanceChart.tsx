"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { formatCurrency } from "@/lib/format";
import type { MonthlyPerformance } from "@/types/crm";

interface SalesPerformanceChartProps {
  data: MonthlyPerformance[];
  height?: number;
}

const MARGIN = { top: 12, right: 12, bottom: 28, left: 48 };
const GRID_LINES = 4;

function niceMax(value: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = magnitude / 2;
  return Math.ceil(value / step) * step;
}

/** Revenue vs target line chart with a crosshair tooltip. */
export function SalesPerformanceChart({ data, height = 260 }: SalesPerformanceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // null until measured: the SVG is drawn at real pixel width so text never scales.
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const width = measuredWidth ?? 640;
  const [active, setActive] = useState<number | null>(null);
  // useId() can contain characters that are invalid inside url(#…).
  const gradientId = `revenue-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const measure = (w: number) => setMeasuredWidth(Math.max(260, Math.round(w)));
    // Measure immediately, then keep in sync with container resizes.
    const frame = requestAnimationFrame(() => measure(element.getBoundingClientRect().width));
    const observer = new ResizeObserver(([entry]) => measure(entry.contentRect.width));
    observer.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  const yMax = niceMax(Math.max(...data.map((d) => Math.max(d.revenue, d.target))));
  const x = (i: number) => MARGIN.left + (data.length === 1 ? innerWidth / 2 : (i / (data.length - 1)) * innerWidth);
  const y = (v: number) => MARGIN.top + innerHeight - (v / yMax) * innerHeight;

  const revenuePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.revenue)}`).join(" ");
  const targetPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.target)}`).join(" ");
  const areaPath = `${revenuePath} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const ticks = Array.from({ length: GRID_LINES + 1 }, (_, i) => (yMax / GRID_LINES) * i);
  // On narrow screens, label every other month to avoid collisions.
  const labelEvery = innerWidth / data.length < 36 ? 2 : 1;

  function indexFromPointer(event: PointerEvent<SVGSVGElement>): number {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * width;
    const ratio = (px - MARGIN.left) / innerWidth;
    return Math.min(data.length - 1, Math.max(0, Math.round(ratio * (data.length - 1))));
  }

  function handleKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActive((i) => (i === null ? 0 : Math.min(data.length - 1, i + 1)));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActive((i) => (i === null ? data.length - 1 : Math.max(0, i - 1)));
    } else if (event.key === "Escape") {
      setActive(null);
    }
  }

  const point = active !== null ? data[active] : null;
  const tooltipLeft = active !== null ? (x(active) / width) * 100 : 0;
  const tooltipOnLeft = active !== null && active > data.length / 2;

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full bg-accent" aria-hidden="true" />
          Revenue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-ink-faint" aria-hidden="true" />
          Target
        </span>
      </div>

      <div ref={containerRef} className="relative w-full" style={{ minHeight: height }}>
        {measuredWidth === null ? (
          <div aria-hidden="true" className="animate-pulse rounded-lg bg-surface-raised/40" style={{ height }} />
        ) : (
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Monthly revenue compared with target over the last 12 months. Use arrow keys to inspect months."
          tabIndex={0}
          className="block touch-pan-y overflow-visible outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-accent/60"
          onPointerMove={(event) => setActive(indexFromPointer(event))}
          onPointerDown={(event) => setActive(indexFromPointer(event))}
          onPointerLeave={() => setActive(null)}
          onKeyDown={handleKeyDown}
          onBlur={() => setActive(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                x2={width - MARGIN.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--color-line)"
                strokeWidth={1}
                strokeDasharray={tick === 0 ? undefined : "2 4"}
              />
              <text
                x={MARGIN.left - 10}
                y={y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fill="var(--color-ink-faint)"
                fontSize={11}
                className="tabular-nums"
              >
                {formatCurrency(tick, { compact: true })}
              </text>
            </g>
          ))}

          {data.map((d, i) =>
            // Count from the newest month so the latest label is always shown.
            (data.length - 1 - i) % labelEvery === 0 ? (
              <text
                key={d.month}
                x={x(i)}
                y={height - 8}
                textAnchor="middle"
                fill={active === i ? "var(--color-ink)" : "var(--color-ink-faint)"}
                fontSize={11}
              >
                {d.month}
              </text>
            ) : null,
          )}

          <path d={areaPath} fill={`url(#${gradientId})`} className="animate-fade-up" />
          <path d={targetPath} fill="none" stroke="var(--color-ink-faint)" strokeWidth={1.5} strokeDasharray="4 4" />
          <path
            d={revenuePath}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {point && active !== null ? (
            <g pointerEvents="none">
              <line
                x1={x(active)}
                x2={x(active)}
                y1={MARGIN.top}
                y2={y(0)}
                stroke="var(--color-line-strong)"
                strokeWidth={1}
              />
              <circle cx={x(active)} cy={y(point.target)} r={3.5} fill="var(--color-ink-faint)" stroke="var(--color-surface)" strokeWidth={2} />
              <circle cx={x(active)} cy={y(point.revenue)} r={5} fill="var(--color-accent)" stroke="var(--color-surface)" strokeWidth={2} />
            </g>
          ) : null}
        </svg>
        )}

        {point && measuredWidth !== null ? (
          <div
            role="status"
            className="pointer-events-none absolute top-2 z-10 w-44 rounded-xl border border-line-strong bg-navy-900/95 p-3 text-xs shadow-xl backdrop-blur"
            style={{
              left: `${tooltipLeft}%`,
              transform: tooltipOnLeft ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
            }}
          >
            <p className="font-medium text-ink">{point.month}</p>
            <dl className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-ink-muted">
                  <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
                  Revenue
                </dt>
                <dd className="font-medium tabular-nums text-ink">{formatCurrency(point.revenue)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-ink-muted">
                  <span className="size-2 rounded-full bg-ink-faint" aria-hidden="true" />
                  Target
                </dt>
                <dd className="tabular-nums text-ink">{formatCurrency(point.target)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line pt-1.5">
                <dt className="text-ink-muted">Deals won</dt>
                <dd className="tabular-nums text-ink">{point.dealsWon}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>

      <table className="sr-only">
        <caption>Monthly revenue and target</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Revenue</th>
            <th scope="col">Target</th>
            <th scope="col">Deals won</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.month}>
              <th scope="row">{d.month}</th>
              <td>{formatCurrency(d.revenue)}</td>
              <td>{formatCurrency(d.target)}</td>
              <td>{d.dealsWon}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

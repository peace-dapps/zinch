"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Nav from "@/components/landing/Nav";
import { PageLoader } from "@/components/ui/Spinner";
import { AdminTabs } from "../page";

type Bucket = {
  date: string;
  fees: number;
  volume: number;
  deals: number;
  signups: number;
};

type Response = {
  series: Bucket[];
  totals: { fees: number; volume: number; deals: number; signups: number };
  days: number;
};

const METRICS = [
  { key: "fees", label: "Fees earned", unit: "SOL", divisor: 1e9, decimals: 4 },
  { key: "volume", label: "Volume completed", unit: "SOL", divisor: 1e9, decimals: 2 },
  { key: "deals", label: "Deals created", unit: "", divisor: 1, decimals: 0 },
  { key: "signups", label: "New signups", unit: "", divisor: 1, decimals: 0 },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

export default function AdminRevenuePage() {
  const { ready, authenticated } = usePrivy();
  const { publicKey, connected } = useWallet();
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [days, setDays] = useState(30);
  const [metric, setMetric] = useState<MetricKey>("fees");

  const walletAddress = publicKey?.toBase58() || null;

  const fetchRevenue = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/revenue?adminWallet=${walletAddress}&days=${days}`
      );
      if (res.status === 403) {
        setUnauthorized(true);
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [walletAddress, days]);

  useEffect(() => {
    if (walletAddress) fetchRevenue();
  }, [walletAddress, fetchRevenue]);

  if (!ready || !authenticated || !connected) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <PageLoader label="Loading" />
      </main>
    );
  }

  if (unauthorized) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-32 text-center md:px-8">
          <h1 className="text-3xl font-bold">Not authorized</h1>
        </div>
      </main>
    );
  }

  if (loading || !data) {
    return (
      <main className="relative min-h-screen">
        <Nav />
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
          <PageLoader label="Loading revenue" />
        </div>
      </main>
    );
  }

  const currentMetric = METRICS.find((m) => m.key === metric)!;

  // Transform data for chart (convert lamports to SOL for display)
  const chartData = data.series.map((b) => ({
    date: b.date,
    value:
      currentMetric.divisor === 1
        ? (b as any)[metric]
        : (b as any)[metric] / currentMetric.divisor,
    displayDate: new Date(b.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <main className="relative min-h-screen">
      <Nav />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-8 md:pt-40">
        <div className="mb-8">
          <div className="mb-2 flex items-baseline gap-2 font-mono text-xs uppercase tracking-widest text-lime">
            <span>[ADMIN]</span>
            <span>REVENUE & GROWTH</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Revenue
          </h1>
        </div>

        <AdminTabs current="revenue" />

        {/* Totals */}
        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          <TotalCard
            label="Fees earned"
            value={`${(data.totals.fees / 1e9).toFixed(4)} SOL`}
            hint={`Last ${data.days}d`}
            highlight
          />
          <TotalCard
            label="Volume completed"
            value={`${(data.totals.volume / 1e9).toFixed(2)} SOL`}
            hint={`Last ${data.days}d`}
          />
          <TotalCard
            label="Deals created"
            value={String(data.totals.deals)}
            hint={`Last ${data.days}d`}
          />
          <TotalCard
            label="New signups"
            value={String(data.totals.signups)}
            hint={`Last ${data.days}d`}
          />
        </div>

        {/* Chart controls */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-1">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={`border px-3 py-1.5 text-xs transition-all ${
                  metric === m.key
                    ? "border-lime bg-lime/10 text-lime"
                    : "border-border text-text-muted hover:border-border-hover hover:text-text"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="border border-border bg-bg px-3 py-1.5 text-xs text-text focus:border-lime focus:outline-none"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        {/* Chart */}
        <div className="border border-border bg-surface p-4 md:p-6">
          <div className="mb-4 text-xs uppercase tracking-widest text-text-faded">
            {currentMetric.label} {currentMetric.unit && `(${currentMetric.unit})`} — daily
          </div>

          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C4FF3E" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#C4FF3E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#606060"
                  tick={{ fontSize: 11, fill: "#606060" }}
                  interval="preserveStartEnd"
                  tickLine={false}
                />
                <YAxis
                  stroke="#606060"
                  tick={{ fontSize: 11, fill: "#606060" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.toFixed(currentMetric.decimals)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0A0A0A",
                    border: "1px solid #2A2A2A",
                    borderRadius: 0,
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#A0A0A0", fontSize: "11px" }}
                  itemStyle={{ color: "#C4FF3E" }}
                  formatter={(value: any) => [
                    `${Number(value).toFixed(currentMetric.decimals)} ${currentMetric.unit}`.trim(),
                    currentMetric.label,
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#C4FF3E"
                  strokeWidth={2}
                  fill="url(#limeGradient)"
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily breakdown */}
        <div className="mt-10">
          <h2 className="mb-4 text-sm uppercase tracking-widest text-text-faded">
            Daily breakdown (last 14 days)
          </h2>
          <div className="border border-border bg-surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left text-xs uppercase tracking-widest text-text-faded">
                    Date
                  </th>
                  <th className="p-3 text-right text-xs uppercase tracking-widest text-text-faded">
                    Fees (SOL)
                  </th>
                  <th className="p-3 text-right text-xs uppercase tracking-widest text-text-faded">
                    Volume (SOL)
                  </th>
                  <th className="p-3 text-right text-xs uppercase tracking-widest text-text-faded">
                    Deals
                  </th>
                  <th className="p-3 text-right text-xs uppercase tracking-widest text-text-faded">
                    Signups
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...data.series]
                  .reverse()
                  .slice(0, 14)
                  .map((row) => (
                    <tr
                      key={row.date}
                      className="border-b border-border last:border-0"
                    >
                      <td className="p-3 text-left font-mono text-xs text-text-muted">
                        {new Date(row.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-3 text-right tabular-nums text-lime">
                        {(row.fees / 1e9).toFixed(4)}
                      </td>
                      <td className="p-3 text-right tabular-nums text-text">
                        {(row.volume / 1e9).toFixed(2)}
                      </td>
                      <td className="p-3 text-right tabular-nums text-text">
                        {row.deals}
                      </td>
                      <td className="p-3 text-right tabular-nums text-text">
                        {row.signups}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

function TotalCard({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border p-4 ${
        highlight ? "border-lime/40 bg-lime/5" : "border-border bg-surface"
      }`}
    >
      <div className="mb-1 text-xs uppercase tracking-wider text-text-faded">
        {label}
      </div>
      <div
        className={`text-xl font-bold tabular-nums md:text-2xl ${
          highlight ? "text-lime" : "text-text"
        }`}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-text-faded">{hint}</div>}
    </div>
  );
}
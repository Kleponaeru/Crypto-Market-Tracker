"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bitcoin,
  ChevronDown,
  Coins,
  ExternalLink,
  Globe,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PublicLayout } from "@/components/public-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ChartData, CoinDetail } from "@/types/coin-detail";

interface CoinPayload {
  coin: CoinDetail;
  chart: {
    prices: [number, number][];
    market_caps: [number, number][];
    total_volumes: [number, number][];
  };
}

type ChartMetric = "price" | "marketCap" | "volume";
type ChartRange = "24h" | "7d";

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

function currency(value: number | null | undefined, compact = false) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  if (compact) return compactCurrency.format(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

function amount(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value);
}

function changeTone(value: number | null | undefined) {
  if (value === null || value === undefined) return "text-muted-foreground";
  return value >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400";
}

function plainDescription(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export default function CoinDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [payload, setPayload] = useState<CoinPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState<ChartMetric>("price");
  const [range, setRange] = useState<ChartRange>("7d");
  const [aboutExpanded, setAboutExpanded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/crypto/coin?id=${encodeURIComponent(id)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Couldn’t load this coin.");
        setPayload(data as CoinPayload);
      } catch (caught) {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : "Couldn’t load this coin.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void load();
    return () => controller.abort();
  }, [id]);

  const coin = payload?.coin;
  const chartData = useMemo<ChartData[]>(() => {
    if (!payload) return [];
    const caps = new Map(payload.chart.market_caps.map(([time, value]) => [time, value]));
    const volumes = new Map(payload.chart.total_volumes.map(([time, value]) => [time, value]));
    const points = payload.chart.prices.map(([time, price]) => ({
      time,
      price,
      marketCap: caps.get(time) ?? null,
      volume: volumes.get(time) ?? null,
    }));
    if (range === "24h" && points.length) {
      const cutoff = points[points.length - 1].time - 24 * 60 * 60 * 1000;
      return points.filter((point) => point.time >= cutoff);
    }
    return points;
  }, [payload, range]);

  const website = coin?.links.homepage.find(Boolean);
  const explorer = coin?.links.blockchain_site.find(Boolean);
  const chartKey = metric === "marketCap" ? "marketCap" : metric;
  const chartLabel = metric === "price" ? "Price" : metric === "marketCap" ? "Market cap" : "24h volume";
  const change24h = coin?.market_data.price_change_percentage_24h;
  const aboutText = coin?.description.en ? plainDescription(coin.description.en) : "";
  const hasLongDescription = aboutText.length > 420;

  const statCards = coin ? [
    { label: "Market cap", value: currency(coin.market_data.market_cap.usd, true), detail: coin.market_cap_rank ? `Rank #${coin.market_cap_rank}` : "Market rank unavailable", icon: BarChart3, tint: "text-violet-600 dark:text-violet-400" },
    { label: "24h volume", value: currency(coin.market_data.total_volume.usd, true), detail: coin.market_data.market_cap.usd ? `${((coin.market_data.total_volume.usd ?? 0) / coin.market_data.market_cap.usd * 100).toFixed(2)}% of market cap` : "Reported by CoinGecko", icon: Activity, tint: "text-sky-600 dark:text-sky-400" },
    { label: "Fully diluted value", value: currency(coin.market_data.fully_diluted_valuation?.usd, true), detail: "Assumes all tokens are in circulation", icon: Coins, tint: "text-indigo-600 dark:text-indigo-400" },
    { label: "Circulating supply", value: `${amount(coin.market_data.circulating_supply)} ${coin.symbol.toUpperCase()}`, detail: coin.market_data.max_supply ? `${((coin.market_data.circulating_supply ?? 0) / coin.market_data.max_supply * 100).toFixed(1)}% of max supply` : "No fixed max supply reported", icon: Bitcoin, tint: "text-amber-600 dark:text-amber-400" },
    { label: "24h price range", value: `${currency(coin.market_data.low_24h.usd, true)} – ${currency(coin.market_data.high_24h.usd, true)}`, detail: "Daily low to daily high", icon: Activity, tint: "text-emerald-600 dark:text-emerald-400" },
  ] : [];

  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-[1280px] space-y-6 pb-10">
        <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ArrowLeft className="size-4" /> Market overview
        </Link>

        {loading ? (
          <div className="space-y-5" aria-label="Loading coin details">
            <div className="h-32 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />)}</div>
            <div className="h-[420px] animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
          </div>
        ) : error || !coin ? (
          <Card className="rounded-2xl"><CardContent className="flex flex-col items-center py-16 text-center">
            <div className="rounded-2xl bg-muted p-3"><Activity className="size-6 text-muted-foreground" /></div>
            <h1 className="mt-4 text-xl font-semibold">Coin details unavailable</h1>
            <p role="status" className="mt-2 max-w-md text-sm text-muted-foreground">{error ?? "We couldn’t find this CoinGecko asset."}</p>
            <Button asChild variant="outline" className="mt-6 rounded-xl"><Link href="/dashboard">Back to market</Link></Button>
          </CardContent></Card>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-8">
              <div className="pointer-events-none absolute -right-14 -top-28 size-80 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-muted sm:size-16">
                    <Image src={coin.image.large} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{coin.name}</h1>
                      <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{coin.symbol}</span>
                      {coin.market_cap_rank && <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">Rank #{coin.market_cap_rank}</span>}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {website && <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border/70 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Globe className="size-3.5" />Website<ExternalLink className="size-3" /></a>}
                      {explorer && <a href={explorer} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border/70 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><ArrowUpRight className="size-3.5" />Explorer<ExternalLink className="size-3" /></a>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current price</div>
                    <div className="mt-1 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">{currency(coin.market_data.current_price.usd)}</div>
                  </div>
                  {change24h !== null && change24h !== undefined && (
                    <div className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold tabular-nums ${changeTone(change24h)} ${change24h >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                      {change24h >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                      {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}% <span className="font-normal opacity-70">24h</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section aria-label="Coin market statistics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {statCards.map((stat) => (
                <Card key={stat.label} className="rounded-2xl border-border/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-muted-foreground">{stat.label}</span><stat.icon className={`size-4 ${stat.tint}`} /></div>
                    <div className="mt-4 truncate text-xl font-semibold tracking-tight tabular-nums">{stat.value}</div>
                    <div className="mt-1.5 truncate text-xs text-muted-foreground">{stat.detail}</div>
                  </CardContent>
                </Card>
              ))}
            </section>

            <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">{chartLabel} history</h2>
                  <p className="mt-1 text-sm text-muted-foreground">CoinGecko historical data · {range === "24h" ? "Last 24 hours" : "Last 7 days"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-xl bg-muted/70 p-1" aria-label="Chart data type">
                    {(["price", "marketCap", "volume"] as ChartMetric[]).map((item) => (
                      <button key={item} type="button" aria-pressed={metric === item} onClick={() => setMetric(item)} className={`min-h-8 cursor-pointer rounded-lg px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${metric === item ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{item === "marketCap" ? "Market cap" : item === "volume" ? "Volume" : "Price"}</button>
                    ))}
                  </div>
                  <div className="flex rounded-xl bg-muted/70 p-1" aria-label="Chart timeframe">
                    {(["24h", "7d"] as ChartRange[]).map((item) => (
                      <button key={item} type="button" aria-pressed={range === item} onClick={() => setRange(item)} className={`min-h-8 cursor-pointer rounded-lg px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${range === item ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{item}</button>
                    ))}
                  </div>
                </div>
              </div>
              <CardContent className="p-3 pt-5 sm:p-5">
                {chartData.length ? (
                  <div className="h-[280px] w-full sm:h-[360px]" aria-label={`${coin.name} ${chartLabel.toLowerCase()} chart`}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 12, right: 8, left: 4, bottom: 0 }}>
                        <defs><linearGradient id="coinChartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.24} /><stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.01} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                        <XAxis dataKey="time" tickLine={false} axisLine={false} minTickGap={40} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} tickFormatter={(value) => new Intl.DateTimeFormat("en-US", range === "24h" ? { hour: "numeric" } : { month: "short", day: "numeric" }).format(new Date(value))} />
                        <YAxis orientation="right" width={68} tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} tickFormatter={(value) => compactCurrency.format(value)} domain={["auto", "auto"]} />
                        <Tooltip labelFormatter={(value) => new Date(Number(value)).toLocaleString()} formatter={(value) => [currency(Number(value), metric !== "price"), chartLabel]} contentStyle={{ backgroundColor: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: "12px", color: "var(--color-popover-foreground)" }} />
                        <Area type="monotone" dataKey={chartKey} stroke="var(--color-primary)" strokeWidth={2} fill="url(#coinChartFill)" connectNulls isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex h-[280px] flex-col items-center justify-center text-center sm:h-[360px]">
                    <BarChart3 className="size-6 text-muted-foreground" />
                    <p className="mt-3 text-sm font-medium">Chart data is unavailable</p>
                    <p className="mt-1 text-xs text-muted-foreground">CoinGecko didn’t return historical prices for this asset.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <Card className="rounded-2xl border-border/70 shadow-sm">
                <div className="border-b border-border/70 p-4 sm:p-5"><h2 className="text-lg font-semibold tracking-tight">Price performance</h2><p className="mt-1 text-sm text-muted-foreground">Change over selected market timeframes</p></div>
                <CardContent className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-5">
                  {[
                    { label: "24 hours", value: coin.market_data.price_change_percentage_24h },
                    { label: "7 days", value: coin.market_data.price_change_percentage_7d },
                    { label: "30 days", value: coin.market_data.price_change_percentage_30d },
                    { label: "1 year", value: coin.market_data.price_change_percentage_1y },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-muted/50 p-3 sm:p-4">
                      <div className="text-xs font-medium text-muted-foreground">{item.label}</div>
                      <div className={`mt-2 flex items-center gap-1 text-lg font-semibold tabular-nums ${changeTone(item.value)}`}>
                        {item.value !== null && item.value !== undefined ? item.value >= 0 ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" /> : null}
                        {item.value === null || item.value === undefined ? "—" : `${item.value >= 0 ? "+" : ""}${item.value.toFixed(2)}%`}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/70 shadow-sm">
                <div className="border-b border-border/70 p-4 sm:p-5"><h2 className="text-lg font-semibold tracking-tight">Price extremes</h2><p className="mt-1 text-sm text-muted-foreground">All time high and low</p></div>
                <CardContent className="space-y-4 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3"><div><div className="text-xs text-muted-foreground">All-time high</div><div className="mt-1 text-lg font-semibold tabular-nums">{currency(coin.market_data.ath.usd)}</div><div className="mt-1 text-xs text-muted-foreground">{coin.market_data.ath_date.usd ? new Date(coin.market_data.ath_date.usd).toLocaleDateString() : "Date unavailable"}</div></div><span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400"><TrendingUp className="size-4" /></span></div>
                  <div className="h-px bg-border/70" />
                  <div className="flex items-start justify-between gap-3"><div><div className="text-xs text-muted-foreground">All-time low</div><div className="mt-1 text-lg font-semibold tabular-nums">{currency(coin.market_data.atl.usd)}</div><div className="mt-1 text-xs text-muted-foreground">{coin.market_data.atl_date.usd ? new Date(coin.market_data.atl_date.usd).toLocaleDateString() : "Date unavailable"}</div></div><span className="rounded-lg bg-rose-500/10 p-2 text-rose-600 dark:text-rose-400"><TrendingDown className="size-4" /></span></div>
                </CardContent>
              </Card>
            </div>

            {aboutText && (
              <Card className="gap-0 rounded-2xl border-border/70 py-0 shadow-sm">
                <div className="border-b border-border/70 px-4 py-3 sm:px-5"><h2 className="text-lg font-semibold tracking-tight">About {coin.name}</h2></div>
                <CardContent className="p-4 sm:px-5 sm:py-4">
                  <p id="coin-description" className={`w-full max-w-none text-sm leading-7 text-muted-foreground sm:text-[15px] ${hasLongDescription && !aboutExpanded ? "line-clamp-5" : ""}`}>
                    {aboutText}
                  </p>
                  {hasLongDescription && (
                    <button
                      type="button"
                      aria-expanded={aboutExpanded}
                      aria-controls="coin-description"
                      onClick={() => setAboutExpanded((expanded) => !expanded)}
                      className="mt-2 inline-flex min-h-9 items-center gap-1 rounded-md text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {aboutExpanded ? "Show less" : "Show more"}
                      <ChevronDown className={`size-4 transition-transform ${aboutExpanded ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}

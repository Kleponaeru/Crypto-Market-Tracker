import {
  Activity,
  BarChart3,
  Bitcoin,
  Coins,
  Layers3,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { GlobalMarketData } from "@/types/market";

interface MarketOverviewProps {
  data: GlobalMarketData["data"] | null;
  loading: boolean;
}

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function MarketOverview({ data, loading }: MarketOverviewProps) {
  const volumeRatio = data
    ? (data.total_volume.usd / data.total_market_cap.usd) * 100
    : 0;

  const stats = [
    {
      label: "Total market cap",
      value: data ? compactCurrency.format(data.total_market_cap.usd) : "—",
      change: data?.market_cap_change_percentage_24h_usd,
      icon: BarChart3,
      accent: "text-violet-600 dark:text-violet-400",
      subline: "Global crypto valuation",
    },
    {
      label: "24h trading volume",
      value: data ? compactCurrency.format(data.total_volume.usd) : "—",
      change: data?.volume_change_percentage_24h_usd,
      icon: Activity,
      accent: "text-sky-600 dark:text-sky-400",
      subline: `${volumeRatio.toFixed(2)}% of market cap`,
    },
    {
      label: "Bitcoin dominance",
      value: data ? `${data.market_cap_percentage.btc.toFixed(1)}%` : "—",
      icon: Bitcoin,
      accent: "text-amber-600 dark:text-amber-400",
      subline: "Share of total market cap",
      bar: data?.market_cap_percentage.btc,
    },
    {
      label: "Ethereum dominance",
      value: data ? `${data.market_cap_percentage.eth.toFixed(1)}%` : "—",
      icon: Coins,
      accent: "text-indigo-600 dark:text-indigo-400",
      subline: "Share of total market cap",
      bar: data?.market_cap_percentage.eth,
    },
    {
      label: "Market breadth",
      value: data ? compactNumber.format(data.active_cryptocurrencies) : "—",
      icon: Layers3,
      accent: "text-emerald-600 dark:text-emerald-400",
      subline: data ? `${compactNumber.format(data.markets)} exchanges tracked` : "Cryptocurrencies tracked",
    },
  ];

  return (
    <section aria-label="Global market statistics" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="group overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md motion-reduce:transform-none"
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <div className={`rounded-xl bg-muted/70 p-2 ${stat.accent}`}>
                <stat.icon className="size-4" aria-hidden="true" />
              </div>
            </div>
            <div
              className={`mt-4 text-2xl font-semibold tracking-tight tabular-nums sm:text-[1.7rem] ${loading ? "animate-pulse text-muted-foreground/50" : ""}`}
              aria-live="polite"
            >
              {loading && !data ? "Loading" : stat.value}
            </div>
            <div className="mt-2 flex min-h-5 items-center gap-1.5 text-xs text-muted-foreground">
              {stat.change !== undefined ? (
                <>
                  {stat.change >= 0 ? (
                    <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <TrendingDown className="size-3.5 text-rose-600 dark:text-rose-400" />
                  )}
                  <span className={stat.change >= 0 ? "font-medium text-emerald-700 dark:text-emerald-400" : "font-medium text-rose-700 dark:text-rose-400"}>
                    {Math.abs(stat.change).toFixed(2)}%
                  </span>
                  <span>in 24 hours</span>
                </>
              ) : (
                <span>{stat.subline}</span>
              )}
            </div>
            {stat.bar !== undefined && (
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
                role="img"
                aria-label={`${stat.label}: ${stat.bar.toFixed(1)} percent`}
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${stat.label.startsWith("Bitcoin") ? "bg-amber-500" : "bg-indigo-500"}`}
                  style={{ width: `${Math.min(stat.bar, 100)}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { MarketCoin } from "@/types/market";

type MarketFilter = "top" | "gainers" | "losers";

interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number | null;
}

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

function price(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

function PercentChange({ value }: { value: number | null }) {
  if (value === null || !Number.isFinite(value)) {
    return <span className="text-muted-foreground">—</span>;
  }
  const positive = value >= 0;
  return (
    <span className={positive ? "font-medium text-emerald-700 dark:text-emerald-400" : "font-medium text-rose-700 dark:text-rose-400"}>
      {positive ? "+" : ""}{value.toFixed(2)}%
    </span>
  );
}

function Sparkline({ coin }: { coin: MarketCoin }) {
  const values = coin.sparkline_in_7d?.price?.filter(Number.isFinite) ?? [];
  if (values.length < 2) return <span className="text-muted-foreground">—</span>;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const points = values
    .map((value, index) => `${(index / (values.length - 1)) * 80},${22 - ((value - min) / spread) * 18}`)
    .join(" ");
  const positive = values[values.length - 1] >= values[0];

  return (
    <svg viewBox="0 0 80 24" className="h-7 w-20" role="img" aria-label={`${coin.name} seven day price trend`}>
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#10b981" : "#f43f5e"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function DailyRange({ coin }: { coin: MarketCoin }) {
  const low = coin.low_24h;
  const high = coin.high_24h;
  if (low === null || high === null || coin.current_price === null || !Number.isFinite(low) || !Number.isFinite(high)) {
    return <span className="text-muted-foreground">—</span>;
  }
  const range = high - low;
  const position = range > 0 ? Math.max(0, Math.min(100, ((coin.current_price - low) / range) * 100)) : 50;

  return (
    <div className="min-w-28" title={`24h low ${price(low)} / high ${price(high)}`}>
      <div className="relative h-1.5 rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 rounded-full bg-primary/35" style={{ width: `${position}%` }} />
        <div className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-sm" style={{ left: `${position}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between gap-2 text-[10px] tabular-nums text-muted-foreground">
        <span>{price(low)}</span><span>{price(high)}</span>
      </div>
    </div>
  );
}

function CoinIdentity({ coin }: { coin: MarketCoin }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
        <Image src={coin.image} alt="" fill sizes="36px" className="object-cover" />
      </div>
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground">{coin.name}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="uppercase">{coin.symbol}</span>
          {coin.market_cap_rank && <span>Rank #{coin.market_cap_rank}</span>}
        </div>
      </div>
    </div>
  );
}

interface TopCoinsProps {
  coins: MarketCoin[];
  loading: boolean;
}

export function TopCoins({ coins, loading }: TopCoinsProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MarketFilter>("top");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState<CoinSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const searchTerm = query.trim();
    if (searchTerm.length < 1) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const response = await fetch(
          `/api/crypto/search?q=${encodeURIComponent(searchTerm)}`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("Coin search is unavailable right now.");
        const data = (await response.json()) as { coins: CoinSearchResult[] };
        setSearchResults(data.coins ?? []);
      } catch (error) {
        if (!controller.signal.aborted) {
          setSearchError(error instanceof Error ? error.message : "Search failed.");
          setSearchResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const filteredCoins = useMemo(() => {
    const matched = coins.filter((coin) =>
      `${coin.name} ${coin.symbol}`.toLowerCase().includes(query.trim().toLowerCase())
    );
    if (filter === "gainers") {
      return matched
        .filter((coin) => coin.price_change_percentage_24h !== null)
        .sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0));
    }
    if (filter === "losers") {
      return matched
        .filter((coin) => coin.price_change_percentage_24h !== null)
        .sort((a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0));
    }
    return matched;
  }, [coins, filter, query]);

  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filteredCoins.length / pageSize));
  const visibleCoins = filteredCoins.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const filters: { key: MarketFilter; label: string }[] = [
    { key: "top", label: "Top assets" },
    { key: "gainers", label: "Gainers" },
    { key: "losers", label: "Losers" },
  ];

  return (
    <Card className="overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border/70 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Cryptocurrency prices</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">USD</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Price action, market value, and trading activity</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-52">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setQuery(nextQuery);
                setCurrentPage(1);
                setFilter("top");
                setSearchResults([]);
                setSearchError(null);
                setSearchLoading(nextQuery.trim().length >= 1);
              }}
              placeholder="Search all coins"
              aria-label="Search all CoinGecko cryptocurrencies"
              className="h-9 rounded-xl pl-9"
            />
          </div>
          <div className="flex rounded-xl bg-muted/70 p-1" aria-label="Filter cryptocurrency list">
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={filter === item.key}
                disabled={query.trim().length >= 1}
                onClick={() => {
                  setFilter(item.key);
                  setCurrentPage(1);
                }}
                className={`min-h-8 cursor-pointer rounded-lg px-3 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 ${filter === item.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        {query.trim().length >= 1 ? (
          <div className="p-4 sm:p-5">
            <p className="mb-3 text-xs text-muted-foreground">
              Searching CoinGecko&apos;s full coin catalog for <span className="font-medium text-foreground">{query.trim()}</span>
            </p>
            {searchLoading ? (
              <div className="space-y-2" aria-label="Searching CoinGecko">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-xl border border-border/60 p-3">
                    <div className="size-9 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                    <div className="flex-1 space-y-2"><div className="h-4 w-36 animate-pulse rounded bg-muted motion-reduce:animate-none" /><div className="h-3 w-20 animate-pulse rounded bg-muted motion-reduce:animate-none" /></div>
                  </div>
                ))}
              </div>
            ) : searchError ? (
              <div role="status" className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-6 text-center text-sm text-rose-700 dark:text-rose-300">
                {searchError} Try again in a moment.
              </div>
            ) : searchResults.length ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {searchResults.map((coin) => (
                  <li key={coin.id}>
                    <Link
                      href={`/coin/${coin.id}`}
                      className="group flex min-h-16 items-center gap-3 rounded-xl border border-border/60 p-3 transition-colors duration-200 hover:border-primary/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
                        {coin.thumb && <Image src={coin.thumb} alt="" fill sizes="36px" className="object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{coin.name}</div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="uppercase">{coin.symbol}</span>
                          {coin.market_cap_rank && <span>Rank #{coin.market_cap_rank}</span>}
                        </div>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
                <Search className="mx-auto size-5 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No coins found</p>
                <p className="mt-1 text-xs text-muted-foreground">Try a different name, ticker, or CoinGecko ID.</p>
              </div>
            )}
          </div>
        ) : (
          <>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[940px] border-collapse text-sm">
            <thead>
              <tr className="bg-muted/30 text-xs text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Asset</th>
                <th className="px-3 py-3 text-right font-medium">Price</th>
                <th className="px-3 py-3 text-right font-medium">24h</th>
                <th className="px-3 py-3 text-right font-medium">7d</th>
                <th className="px-3 py-3 text-right font-medium">24h range</th>
                <th className="px-3 py-3 text-right font-medium">Market cap / FDV</th>
                <th className="px-3 py-3 text-right font-medium">24h volume / supply</th>
                <th className="px-5 py-3 text-right font-medium">7d trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={8} className="px-5 py-4"><div className="h-9 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" /></td>
                  </tr>
                ))
              ) : visibleCoins.length ? (
                visibleCoins.map((coin) => (
                  <tr key={coin.id} className="group transition-colors duration-150 hover:bg-muted/40">
                    <td className="px-5 py-3.5">
                      <Link href={`/coin/${coin.id}`} className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <CoinIdentity coin={coin} />
                      </Link>
                    </td>
                    <td className="px-3 py-3.5 text-right font-medium tabular-nums">{price(coin.current_price)}</td>
                    <td className="px-3 py-3.5 text-right tabular-nums"><PercentChange value={coin.price_change_percentage_24h} /></td>
                    <td className="px-3 py-3.5 text-right tabular-nums"><PercentChange value={coin.price_change_percentage_7d_in_currency} /></td>
                    <td className="px-3 py-3.5"><DailyRange coin={coin} /></td>
                    <td className="px-3 py-3.5 text-right tabular-nums">
                      <div>{coin.market_cap === null ? "—" : compactCurrency.format(coin.market_cap)}</div>
                      <div className="mt-1 text-[10px] text-muted-foreground">FDV {coin.fully_diluted_valuation ? compactCurrency.format(coin.fully_diluted_valuation) : "—"}</div>
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums">
                      <div className="text-muted-foreground">{coin.total_volume === null ? "—" : compactCurrency.format(coin.total_volume)}</div>
                      <div className="mt-1 text-[10px] text-muted-foreground">Circ. {coin.circulating_supply === null ? "—" : compactNumber.format(coin.circulating_supply)} {coin.circulating_supply === null ? "" : coin.symbol.toUpperCase()}</div>
                    </td>
                    <td className="px-5 py-3.5"><div className="flex justify-end"><Sparkline coin={coin} /></div></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-muted-foreground">No assets match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-border/60 md:hidden">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-3 p-4"><div className="h-10 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" /><div className="h-4 animate-pulse rounded bg-muted motion-reduce:animate-none" /></div>
            ))
          ) : visibleCoins.length ? (
            visibleCoins.map((coin) => (
              <Link key={coin.id} href={`/coin/${coin.id}`} className="block p-4 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                <div className="flex items-center justify-between gap-3">
                  <CoinIdentity coin={coin} />
                  <div className="shrink-0 text-right">
                    <div className="font-semibold tabular-nums">{price(coin.current_price)}</div>
                    <div className="text-xs tabular-nums"><PercentChange value={coin.price_change_percentage_24h} /></div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div><div className="text-muted-foreground">7d change</div><div className="mt-1 tabular-nums"><PercentChange value={coin.price_change_percentage_7d_in_currency} /></div></div>
                  <div><div className="text-muted-foreground">Market cap</div><div className="mt-1 font-medium tabular-nums">{coin.market_cap === null ? "—" : compactCurrency.format(coin.market_cap)}</div></div>
                  <div><div className="text-muted-foreground">Fully diluted value</div><div className="mt-1 font-medium tabular-nums">{coin.fully_diluted_valuation === null ? "—" : compactCurrency.format(coin.fully_diluted_valuation)}</div></div>
                  <div><div className="text-muted-foreground">24h volume</div><div className="mt-1 font-medium tabular-nums">{coin.total_volume === null ? "—" : compactCurrency.format(coin.total_volume)}</div></div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs">
                  <span className="shrink-0 text-muted-foreground">24h range</span>
                  <DailyRange coin={coin} />
                </div>
              </Link>
            ))
          ) : (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">No assets match your search.</div>
          )}
        </div>
        {!loading && filteredCoins.length > 0 && (
          <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground sm:px-5">
            <span>Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredCoins.length)} of {filteredCoins.length} assets</span>
            <div className="flex items-center gap-3">
              {filter !== "top" && (
                <span className="hidden items-center gap-1 sm:inline-flex">
                  {filter === "gainers" ? <ArrowUp className="size-3 text-emerald-600" /> : <ArrowDown className="size-3 text-rose-600" />}
                  Top 50 by market cap · sorted by 24h change
                </span>
              )}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  className="inline-flex min-h-8 cursor-pointer items-center justify-center gap-1 rounded-lg border border-border px-2 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                ><ChevronLeft className="size-4" /><span className="hidden sm:inline">Previous</span></button>
                <span className="min-w-16 text-center tabular-nums">{currentPage} / {pageCount}</span>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage >= pageCount}
                  onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                  className="inline-flex min-h-8 cursor-pointer items-center justify-center gap-1 rounded-lg border border-border px-2 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                ><span className="hidden sm:inline">Next</span><ChevronRight className="size-4" /></button>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

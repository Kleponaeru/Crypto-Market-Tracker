"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Coins, History, PieChart, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortfolioOverview } from "@/components/portfolio/portfolio-overview";
import { TransactionsList } from "@/components/portfolio/transactions-list";
import { HoldingsList } from "@/components/portfolio/holdings-list";
import { PortfolioPieChart } from "@/components/portfolio/portfolio-pie-chart";

export function PortfolioContent() {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleUpdate = () => setRefreshKey((previous) => previous + 1);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 pb-10">
      <section className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Wallet className="size-3.5" /> Personal workspace
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your portfolio</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">Review your positions, activity, and allocation in one place.</p>
        </div>
        <Button asChild variant="outline" className="w-full cursor-pointer rounded-xl sm:w-auto">
          <Link href="/dashboard">Explore markets <ArrowUpRight className="size-4" /></Link>
        </Button>
      </section>

      <PortfolioOverview key={refreshKey} />

      <Tabs defaultValue="transactions" className="w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Portfolio details</h2>
            <p className="mt-1 text-sm text-muted-foreground">Switch between activity, assets, and allocation.</p>
          </div>
          <TabsList className="grid h-11 w-full grid-cols-3 rounded-xl bg-muted/70 p-1 sm:w-auto">
            <TabsTrigger value="transactions" className="min-h-9 cursor-pointer rounded-lg px-3 text-xs sm:px-4 sm:text-sm">
              <History className="size-4" /><span>Activity</span>
            </TabsTrigger>
            <TabsTrigger value="holdings" className="min-h-9 cursor-pointer rounded-lg px-3 text-xs sm:px-4 sm:text-sm">
              <Coins className="size-4" /><span>Holdings</span>
            </TabsTrigger>
            <TabsTrigger value="chart" className="min-h-9 cursor-pointer rounded-lg px-3 text-xs sm:px-4 sm:text-sm">
              <PieChart className="size-4" /><span>Allocation</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="transactions" className="mt-5">
          <TransactionsList key={refreshKey} onUpdate={handleUpdate} />
        </TabsContent>
        <TabsContent value="holdings" className="mt-5">
          <HoldingsList key={refreshKey} />
        </TabsContent>
        <TabsContent value="chart" className="mt-5">
          <PortfolioPieChart key={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

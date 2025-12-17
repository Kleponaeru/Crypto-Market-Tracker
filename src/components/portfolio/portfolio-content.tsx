"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortfolioOverview } from "@/components/portfolio/portfolio-overview";
import { TransactionsList } from "@/components/portfolio/transactions-list";
import { HoldingsList } from "@/components/portfolio/holdings-list";
import { PortfolioPieChart } from "@/components/portfolio/portfolio-pie-chart";
import { History, Coins, PieChart } from "lucide-react";

export function PortfolioContent() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Portfolio</h1>
        <p className="text-muted-foreground">
          Track your crypto holdings and transactions
        </p>
      </div>

      <PortfolioOverview key={refreshKey} />

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="holdings" className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Holdings
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Distribution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          <TransactionsList key={refreshKey} onUpdate={handleUpdate} />
        </TabsContent>

        <TabsContent value="holdings" className="mt-6">
          <HoldingsList key={refreshKey} />
        </TabsContent>

        <TabsContent value="chart" className="mt-6">
          <PortfolioPieChart key={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

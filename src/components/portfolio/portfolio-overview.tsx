"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, DollarSign } from "lucide-react"
import { getTransactions, type Transaction } from "@/lib/portfolio-storage"

export function PortfolioOverview() {
  const [totalValue, setTotalValue] = useState(0)
  const [totalInvested, setTotalInvested] = useState(0)
  const [profitLoss, setProfitLoss] = useState(0)
  const [profitLossPercent, setProfitLossPercent] = useState(0)

  useEffect(() => {
    const calculatePortfolio = async () => {
      const transactions = getTransactions()

      // Group transactions by coin
      const holdings: Record<string, { amount: number; invested: number }> = {}

      transactions.forEach((tx: Transaction) => {
        if (!holdings[tx.coinId]) {
          holdings[tx.coinId] = { amount: 0, invested: 0 }
        }

        if (tx.type === "buy") {
          holdings[tx.coinId].amount += tx.amount
          holdings[tx.coinId].invested += tx.amount * tx.pricePerCoin
        } else {
          holdings[tx.coinId].amount -= tx.amount
          holdings[tx.coinId].invested -= tx.amount * tx.pricePerCoin
        }
      })

      // Fetch current prices
      const coinIds = Object.keys(holdings).join(",")
      if (coinIds) {
        try {
          const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`)
          const prices = await response.json()

          let currentValue = 0
          let invested = 0

          Object.entries(holdings).forEach(([coinId, holding]) => {
            const currentPrice = prices[coinId]?.usd || 0
            currentValue += holding.amount * currentPrice
            invested += holding.invested
          })

          setTotalValue(currentValue)
          setTotalInvested(invested)

          const pl = currentValue - invested
          setProfitLoss(pl)
          setProfitLossPercent(invested > 0 ? (pl / invested) * 100 : 0)
        } catch (error) {
          console.error("Error fetching prices:", error)
        }
      }
    }

    calculatePortfolio()
    const interval = setInterval(calculatePortfolio, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const stats = [
    {
      title: "Total Value",
      value: formatCurrency(totalValue),
      icon: Wallet,
    },
    {
      title: "Total Invested",
      value: formatCurrency(totalInvested),
      icon: DollarSign,
    },
    {
      title: "Profit/Loss",
      value: formatCurrency(profitLoss),
      change: profitLossPercent,
      icon: profitLoss >= 0 ? TrendingUp : TrendingDown,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.change !== undefined && (
              <div className="flex items-center gap-1 text-xs mt-1">
                {stat.change >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-success" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-destructive" />
                )}
                <span className={stat.change >= 0 ? "text-success" : "text-destructive"}>
                  {Math.abs(stat.change).toFixed(2)}%
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

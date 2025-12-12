"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addTransaction } from "@/lib/portfolio-storage"
import { useToast } from "@/hooks/use-toast"

interface Coin {
  id: string
  symbol: string
  name: string
}

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddTransactionDialog({ open, onOpenChange, onSuccess }: AddTransactionDialogProps) {
  const [coins, setCoins] = useState<Coin[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null)
  const [type, setType] = useState<"buy" | "sell">("buy")
  const [amount, setAmount] = useState("")
  const [pricePerCoin, setPricePerCoin] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchCoins()
    }
  }, [open])

  const fetchCoins = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1",
      )
      const data = await response.json()
      setCoins(data.map((coin: any) => ({ id: coin.id, symbol: coin.symbol, name: coin.name })))
    } catch (error) {
      console.error("Error fetching coins:", error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCoin || !amount || !pricePerCoin) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    addTransaction({
      coinId: selectedCoin.id,
      coinSymbol: selectedCoin.symbol,
      coinName: selectedCoin.name,
      type,
      amount: Number.parseFloat(amount),
      pricePerCoin: Number.parseFloat(pricePerCoin),
      date,
    })

    toast({
      title: "Transaction added",
      description: `${type === "buy" ? "Bought" : "Sold"} ${amount} ${selectedCoin.symbol.toUpperCase()}`,
    })

    setIsLoading(false)
    resetForm()
    onSuccess()
  }

  const resetForm = () => {
    setSelectedCoin(null)
    setSearchQuery("")
    setType("buy")
    setAmount("")
    setPricePerCoin("")
    setDate(new Date().toISOString().split("T")[0])
  }

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>Record a new buy or sell transaction for your portfolio.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coin">Cryptocurrency</Label>
            <Select
              value={selectedCoin?.id || ""}
              onValueChange={(value) => {
                const coin = coins.find((c) => c.id === value)
                setSelectedCoin(coin || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Search coins..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-2"
                  />
                </div>
                {filteredCoins.slice(0, 50).map((coin) => (
                  <SelectItem key={coin.id} value={coin.id}>
                    {coin.name} ({coin.symbol.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select value={type} onValueChange={(value: "buy" | "sell") => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerCoin">Price per Coin (USD)</Label>
              <Input
                id="pricePerCoin"
                type="number"
                step="any"
                placeholder="0.00"
                value={pricePerCoin}
                onChange={(e) => setPricePerCoin(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          {amount && pricePerCoin && (
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Value:</span>
                <span className="text-lg font-bold">
                  ${(Number.parseFloat(amount) * Number.parseFloat(pricePerCoin)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Adding..." : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

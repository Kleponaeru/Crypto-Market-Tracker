"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CreateTransactionPayload } from "../../../types/transaction";

interface Coin {
  id: string;
  symbol: string;
  name: string;
}

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddTransactionDialogProps) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [type, setType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [pricePerCoin, setPricePerCoin] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setCoins([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${searchQuery}`
        );
        const data = await res.json();

        setCoins(
          data.coins.map((coin: any) => ({
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
          }))
        );
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 400); // debounce 400ms

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCoin || !amount || !pricePerCoin) {
      toast.error("Missing information", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    const payload: CreateTransactionPayload = {
      coinId: selectedCoin.id,
      coinName: selectedCoin.name,
      symbol: selectedCoin.symbol,
      type,
      amount: Number(amount),
      pricePerUnit: Number(pricePerCoin),
      date,
    };

    try {
      setIsLoading(true);

      const wrapped = await toast.promise(
        fetch("/api/portfolio/transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        {
          loading: "Adding transaction...",
          success: "Transaction added",
          error: "Failed to add transaction",
        }
      );

      const res = await wrapped.unwrap();

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error ?? "Failed to add transaction");
      }

      resetForm();
      onSuccess();
    } catch (err) {
      // toast already handled by toast.promise
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCoin(null);
    setSearchQuery("");
    setType("buy");
    setAmount("");
    setPricePerCoin("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Record a new buy or sell transaction for your portfolio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 rounded-lg border p-1">
            <button
              type="button"
              onClick={() => setType("buy")}
              className={cn(
                "rounded-md py-2 text-sm font-medium transition",
                type === "buy"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              Buy
            </button>

            <button
              type="button"
              onClick={() => setType("sell")}
              className={cn(
                "rounded-md py-2 text-sm font-medium transition",
                type === "sell"
                  ? "bg-destructive text-destructive-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              Sell
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coin">Cryptocurrency</Label>
            <Select
              value={selectedCoin?.id || ""}
              onValueChange={(value) => {
                const coin = coins.find((c) => c.id === value);
                setSelectedCoin(coin || null);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Search coins..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onKeyUp={(e) => e.stopPropagation()}
                    className="mb-2"
                  />
                </div>
                {searchQuery.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Start typing to search coins
                  </div>
                )}

                {coins.length === 0 && searchQuery.length > 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No results found
                  </div>
                )}

                {coins.slice(0, 20).map((coin) => (
                  <SelectItem
                    key={coin.id}
                    value={coin.id}
                    className="data-[highlighted]:bg-primary data-[highlighted]:text-foreground"
                  >
                    {coin.name} ({coin.symbol.toUpperCase()})
                  </SelectItem>
                ))}
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
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {amount && pricePerCoin && (
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Value:
                </span>
                <span className="text-lg font-bold">
                  $
                  {(
                    Number.parseFloat(amount) * Number.parseFloat(pricePerCoin)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 hover:bg-secondary dark:hover:bg-secondary hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 text-white"
            >
              {isLoading ? "Adding..." : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

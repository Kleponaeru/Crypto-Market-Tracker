"use client";

import type React from "react";

import { useState } from "react";
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
import type { Transaction } from "../../../types/transaction";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction;
  onSuccess: () => void;
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: EditTransactionDialogProps) {
  const [type, setType] = useState<"buy" | "sell">(transaction.type);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [pricePerCoin, setPricePerCoin] = useState(
    transaction.pricePerCoin.toString()
  );
  const [date, setDate] = useState(transaction.createdAt.split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !pricePerCoin) {
      toast.error("Missing information", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/portfolio/transaction/${transaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: Number(amount),
          pricePerUnit: Number(pricePerCoin),
          date,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update transaction");
      }

      toast.success("Transaction updated", {
        description: "Your transaction has been successfully updated.",
      });

      onSuccess();
    } catch (err: any) {
      toast.error("Error", {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update the details of your {transaction.coinName} transaction.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Transaction Type</Label>

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
          </div>

          <div className="space-y-2">
            <Label>Cryptocurrency</Label>
            <Input
              value={`${
                transaction.coinName
              } (${transaction.coinSymbol.toUpperCase()})`}
              disabled
            />
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
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

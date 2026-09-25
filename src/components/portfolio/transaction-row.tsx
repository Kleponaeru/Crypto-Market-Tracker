"use client";

import { Button } from "@/components/ui/button";
import { Edit2, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import type { Transaction } from "../../../types/transaction";
import { toast } from "sonner";

interface TransactionRowProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onUpdate: () => void;
}

export function TransactionRow({
  transaction,
  onEdit,
  onUpdate,
}: TransactionRowProps) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const res = await fetch(`/api/portfolio/transaction/${transaction.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete transaction");
      }

      toast.success("Transaction deleted", {
        description: "The transaction has been removed from your portfolio.",
      });

      onUpdate();
    } catch (err: any) {
      toast.error("Error", {
        description: err.message,
      });
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const totalValue = transaction.amount * transaction.pricePerCoin;

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 rounded-xl border border-border/60 p-3 transition-colors duration-200 hover:bg-muted/30 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4 sm:p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
            transaction.type === "buy" ? "bg-success/10" : "bg-destructive/10"
          }`}
        >
          {transaction.type === "buy" ? (
            <TrendingUp className="w-5 h-5 text-success" />
          ) : (
            <TrendingDown className="w-5 h-5 text-destructive" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{transaction.coinName}</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                transaction.type === "buy"
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {transaction.type.toUpperCase()}
            </span>
          </div>
          <div className="truncate text-xs text-muted-foreground sm:text-sm">
            {transaction.amount} {transaction.coinSymbol.toUpperCase()} @{" "}
            {formatCurrency(transaction.pricePerCoin)}
          </div>
        </div>
      </div>

      <div className="self-center text-right">
        <div className="text-sm font-semibold tabular-nums sm:text-base">{formatCurrency(totalValue)}</div>
        <div className="text-xs text-muted-foreground sm:text-sm">
          {formatDate(transaction.createdAt)}
        </div>
      </div>

      <div className="col-span-2 flex items-center justify-end gap-1 sm:col-span-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Edit ${transaction.coinName} transaction`}
          onClick={() => onEdit(transaction)}
          className="cursor-pointer rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
        >
          <Edit2 className="w-4 h-4 stroke-current" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${transaction.coinName} transaction`}
          onClick={handleDelete}
          className="cursor-pointer rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="w-4 h-4 stroke-current" />
        </Button>
      </div>
    </div>
  );
}

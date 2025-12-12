"use client"

import { Button } from "@/components/ui/button"
import { Edit2, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { deleteTransaction, type Transaction } from "@/lib/portfolio-storage"
import { useToast } from "@/hooks/use-toast"

interface TransactionRowProps {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onUpdate: () => void
}

export function TransactionRow({ transaction, onEdit, onUpdate }: TransactionRowProps) {
  const { toast } = useToast()

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteTransaction(transaction.id)
      toast({
        title: "Transaction deleted",
        description: "The transaction has been removed from your portfolio.",
      })
      onUpdate()
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const totalValue = transaction.amount * transaction.pricePerCoin

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
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
                transaction.type === "buy" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              }`}
            >
              {transaction.type.toUpperCase()}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {transaction.amount} {transaction.coinSymbol.toUpperCase()} @ {formatCurrency(transaction.pricePerCoin)}
          </div>
        </div>
      </div>

      <div className="hidden sm:block text-right">
        <div className="font-medium">{formatCurrency(totalValue)}</div>
        <div className="text-sm text-muted-foreground">{formatDate(transaction.date)}</div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(transaction)}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  )
}

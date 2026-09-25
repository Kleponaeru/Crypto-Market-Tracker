"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { TransactionRow } from "./transaction-row";
import type { Transaction } from "../../../types/transaction";
import { toast } from "sonner";

interface TransactionsListProps {
  onUpdate?: () => void;
}

export function TransactionsList({ onUpdate }: TransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/portfolio/transaction");

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to load transactions");
      }

      const data: Transaction[] = await res.json();
      setTransactions(data);
    } catch (err: any) {
      toast.error("Error", {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    loadTransactions();
    onUpdate?.(); // Notify parent to refresh
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedTransaction(null);
  };

  const handleTransactionUpdate = () => {
    loadTransactions();
    onUpdate?.(); // Notify parent to refresh
  };

  return (
    <>
      <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/70 p-4 sm:p-5">
          <div>
            <CardTitle className="text-lg">Recent activity</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Your recorded buys and sells</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="min-h-10 cursor-pointer rounded-xl text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </CardHeader>

        <CardContent className="p-3 sm:p-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-muted-foreground">
              <p className="mb-4 font-medium text-foreground">No transactions yet</p>
              <Button
                onClick={() => setAddDialogOpen(true)}
                variant="outline"
                className="cursor-pointer rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Transaction
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={handleEdit}
                  onUpdate={handleTransactionUpdate}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddTransactionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleDialogClose}
      />

      {selectedTransaction && (
        <EditTransactionDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          transaction={selectedTransaction}
          onSuccess={handleDialogClose}
        />
      )}
    </>
  );
}

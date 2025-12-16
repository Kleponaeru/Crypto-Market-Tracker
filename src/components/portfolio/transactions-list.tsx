"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { TransactionRow } from "./transaction-row";
import { getTransactions, type Transaction } from "@/lib/portfolio-storage";

export function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const txs = getTransactions();
    setTransactions(txs);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    loadTransactions();
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Transactions</CardTitle>
          <Button onClick={() => setAddDialogOpen(true)} className="text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No transactions yet</p>
              <Button
                onClick={() => setAddDialogOpen(true)}
                variant="outline"
                className="bg-transparent hover:bg-secondary dark:hover:bg-secondary hover:text-foreground"
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
                  onUpdate={loadTransactions}
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

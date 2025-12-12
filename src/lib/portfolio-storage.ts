export interface Transaction {
  id: string
  coinId: string
  coinSymbol: string
  coinName: string
  type: "buy" | "sell"
  amount: number
  pricePerCoin: number
  date: string
  createdAt: string
}

const STORAGE_KEY = "crypto_portfolio_transactions"

export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function addTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Transaction {
  const newTransaction: Transaction = {
    ...transaction,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }

  const transactions = getTransactions()
  transactions.unshift(newTransaction)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))

  return newTransaction
}

export function updateTransaction(
  id: string,
  updates: Partial<Omit<Transaction, "id" | "coinId" | "coinSymbol" | "coinName" | "createdAt">>,
): void {
  const transactions = getTransactions()
  const index = transactions.findIndex((tx) => tx.id === id)

  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }
}

export function deleteTransaction(id: string): void {
  const transactions = getTransactions()
  const filtered = transactions.filter((tx) => tx.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

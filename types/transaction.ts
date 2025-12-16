export type CreateTransactionPayload = {
  coinId: string;
  coinName: string;
  symbol: string;
  type: "buy" | "sell";
  amount: number;
  pricePerUnit: number;
  date: string;
};

export type Transaction = {
  id: number;
  type: "buy" | "sell";
  amount: number;
  pricePerCoin: number;
  createdAt: string;

  // joined / derived fields
  coinId: string;
  coinName: string;
  coinSymbol: string;
};

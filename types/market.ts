export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  market_cap_rank: number | null;
  fully_diluted_valuation: number | null;
  total_volume: number | null;
  high_24h: number | null;
  low_24h: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d_in_currency: number | null;
  circulating_supply: number | null;
  max_supply: number | null;
  sparkline_in_7d?: { price: number[] };
}

export interface TrendingCoin {
  item: {
    id: string;
    name: string;
    symbol: string;
    small: string;
    price_btc: number;
    score: number;
    market_cap_rank?: number;
  };
}

export interface GlobalMarketData {
  data: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number; eth: number };
    market_cap_change_percentage_24h_usd: number;
    volume_change_percentage_24h_usd?: number;
  };
}

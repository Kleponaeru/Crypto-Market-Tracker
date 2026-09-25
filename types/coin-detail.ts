export interface ChartData {
  time: number;
  price: number;
  marketCap: number | null;
  volume: number | null;
}

export interface CoinDetail {
  id: string;
  name: string;
  symbol: string;
  image: { large: string };
  market_cap_rank: number | null;
  market_data: {
    current_price: { usd: number | null };
    market_cap: { usd: number | null };
    fully_diluted_valuation?: { usd: number | null } | null;
    total_volume: { usd: number | null };
    high_24h: { usd: number | null };
    low_24h: { usd: number | null };
    price_change_percentage_24h: number | null;
    price_change_percentage_7d: number | null;
    price_change_percentage_30d: number | null;
    price_change_percentage_1y: number | null;
    ath: { usd: number | null };
    ath_date: { usd: string | null };
    atl: { usd: number | null };
    atl_date: { usd: string | null };
    circulating_supply: number | null;
    total_supply: number | null;
    max_supply: number | null;
  };
  description: { en: string };
  links: {
    homepage: string[];
    blockchain_site: string[];
  };
}

export interface User {
  id: string;
  name: string;
  online: boolean;
  balance: number;
}

export interface Item {
  id: string;
  scheduledId: number;
  name: string;
  currentPrice: number;
  currentBid: number;
  highestBidderId?: string;
  // Mimic SpacetimeDB timestamp structure for compatibility
  scheduledAt: {
    value: {
        __timestamp_micros_since_unix_epoch__: bigint;
    }
  };
}

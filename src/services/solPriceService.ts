export class SolPriceService {
  private static instance: SolPriceService;
  private price: number | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute cache
  private readonly FALLBACK_PRICE = 150; // Fallback price in USD

  static getInstance(): SolPriceService {
    if (!SolPriceService.instance) {
      SolPriceService.instance = new SolPriceService();
    }
    return SolPriceService.instance;
  }

  async getCurrentPrice(): Promise<number> {
    const now = Date.now();
    
    // Return cached price if available and not expired
    if (this.price !== null && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.price;
    }

    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      const fetchedPrice = data?.solana?.usd;
      
      if (typeof fetchedPrice === 'number' && fetchedPrice > 0) {
        this.price = fetchedPrice;
        this.lastFetch = now;
        return this.price;
      }
    } catch (error) {
      console.warn('Failed to fetch SOL price:', error);
    }

    // Return cached price if fetch failed but we have a cached value
    if (this.price !== null) {
      return this.price;
    }

    // Return fallback price if no cached value available
    return this.FALLBACK_PRICE;
  }

  convertSolToUsd(solAmount: number): Promise<number> {
    return this.getCurrentPrice().then(price => solAmount * price);
  }

  // Get the current cached price without fetching (returns null if not cached)
  getCachedPrice(): number | null {
    return this.price;
  }
}

// Export singleton instance
export const solPriceService = SolPriceService.getInstance();
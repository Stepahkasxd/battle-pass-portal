export const WALLET_ADDRESSES = {
  BTC: "bc1qlylmmgvfsmu8wxq2xfr63yxduf66nkcdzw6krj0l2g04qrns07ms5s0yfx",
  ETH: "bc1qlylmmgvfsmu8wxq2xfr63yxduf66nkcdzw6krj0l2g04qrns07ms5s0yfx",
  USDT: "TJQhvafmPR3fGrKz7dhbThMtw1xQnGdyQm",
  BNB: "0x2c6a98e6079e6d465e7c964a647afc6200026083",
  SOL: "5xhjkZ5WFe8JSNCZYmMjEw1yCGvckTRxCG4KuzW3vorR",
  XRP: "rUzWJkXyEtT8ekSSxkBYPqCvHpngcy6Fks",
  USDC: "0x2c6a98e6079e6d465e7c964a647afc6200026083"
};

// Mock exchange rates (in USD) - in a real app, these would come from an API
export const CRYPTO_RATES = {
  BTC: 43000,
  ETH: 2300,
  USDT: 1,
  BNB: 300,
  SOL: 95,
  XRP: 0.50,
  USDC: 1
};

export const calculateCryptoAmount = (rubleAmount: number, cryptoSymbol: string): number => {
  const usdAmount = rubleAmount / 90; // Approximate RUB/USD rate
  const cryptoRate = CRYPTO_RATES[cryptoSymbol as keyof typeof CRYPTO_RATES] || 0;
  return cryptoRate ? usdAmount / cryptoRate : 0;
};
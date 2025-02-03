import { Bitcoin, Coins, Currency } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export const CRYPTOCURRENCIES = [
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', icon: Bitcoin },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', icon: Coins },
  { id: 'USDT', name: 'Tether', symbol: 'USDT', icon: Currency },
  { id: 'BNB', name: 'Binance Coin', symbol: 'BNB', icon: Coins },
  { id: 'SOL', name: 'Solana', symbol: 'SOL', icon: Coins },
  { id: 'XRP', name: 'Ripple', symbol: 'XRP', icon: Currency },
  { id: 'USDC', name: 'USD Coin', symbol: 'USDC', icon: Currency },
];

interface CryptoPaymentFormProps {
  selectedCrypto: string;
  setSelectedCrypto: (value: string) => void;
  walletAddress: string;
  setWalletAddress: (value: string) => void;
}

export const CryptoPaymentForm = ({
  selectedCrypto,
  setSelectedCrypto,
  walletAddress,
  setWalletAddress,
}: CryptoPaymentFormProps) => {
  return (
    <div className="space-y-4">
      <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
        <SelectTrigger className="bg-colizeum-dark">
          <SelectValue placeholder="Выберите криптовалюту" />
        </SelectTrigger>
        <SelectContent>
          {CRYPTOCURRENCIES.map((crypto) => {
            const IconComponent = crypto.icon;
            return (
              <SelectItem key={crypto.id} value={crypto.id}>
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  {crypto.name} ({crypto.symbol})
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <Input
        placeholder="Адрес криптокошелька"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        className="bg-colizeum-dark"
      />
      <p className="text-sm text-gray-400">
        * Комиссия за оплату криптовалютой составляет 5%
      </p>
    </div>
  );
};
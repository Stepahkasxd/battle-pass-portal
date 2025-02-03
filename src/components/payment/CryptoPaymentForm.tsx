import { Bitcoin, Coins, Currency } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { WALLET_ADDRESSES, calculateCryptoAmount } from "@/utils/crypto";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  amount: number;
}

export const CryptoPaymentForm = ({
  selectedCrypto,
  setSelectedCrypto,
  walletAddress,
  setWalletAddress,
  amount,
}: CryptoPaymentFormProps) => {
  const [showWalletAddress, setShowWalletAddress] = useState(false);
  const { toast } = useToast();

  const cryptoAmount = selectedCrypto ? calculateCryptoAmount(amount, selectedCrypto) : 0;
  const merchantWallet = selectedCrypto ? WALLET_ADDRESSES[selectedCrypto as keyof typeof WALLET_ADDRESSES] : '';

  const handleCopyAddress = () => {
    if (merchantWallet) {
      navigator.clipboard.writeText(merchantWallet);
      toast({
        title: "Адрес скопирован",
        description: "Адрес кошелька скопирован в буфер обмена",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Select value={selectedCrypto} onValueChange={(value) => {
        setSelectedCrypto(value);
        setShowWalletAddress(false);
      }}>
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

      {selectedCrypto && (
        <div className="text-sm text-gray-400">
          К оплате: {cryptoAmount.toFixed(8)} {selectedCrypto}
          <br />
          (включая комиссию 5%)
        </div>
      )}

      <Input
        placeholder="Адрес вашего криптокошелька"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        className="bg-colizeum-dark"
      />

      {showWalletAddress && merchantWallet && (
        <Alert className="bg-colizeum-dark border-colizeum-cyan">
          <AlertDescription className="break-all">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-semibold mb-1">Адрес для оплаты {selectedCrypto}:</p>
                <p className="text-sm">{merchantWallet}</p>
                {selectedCrypto === 'XRP' && (
                  <p className="text-sm mt-1">Tag: 6311125</p>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={handleCopyAddress}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <p className="text-sm text-gray-400">
        * Комиссия за оплату криптовалютой составляет 5%
      </p>

      {selectedCrypto && walletAddress && !showWalletAddress && (
        <Button 
          className="w-full"
          onClick={() => setShowWalletAddress(true)}
        >
          Получить адрес для оплаты
        </Button>
      )}
    </div>
  );
};
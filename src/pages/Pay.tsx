import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Star, Zap, CreditCard, Bitcoin, Coins, Currency } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CRYPTOCURRENCIES = [
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', icon: Bitcoin },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', icon: Coins },
  { id: 'USDT', name: 'Tether', symbol: 'USDT', icon: Currency },
  { id: 'BNB', name: 'Binance Coin', symbol: 'BNB', icon: Coins },
  { id: 'SOL', name: 'Solana', symbol: 'SOL', icon: Coins },
  { id: 'XRP', name: 'Ripple', symbol: 'XRP', icon: Currency },
  { id: 'USDC', name: 'USD Coin', symbol: 'USDC', icon: Currency },
];

const BASE_PRICE = 499;
const CRYPTO_FEE_PERCENTAGE = 5;

const Pay = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  
  // Card payment state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // Crypto payment state
  const [selectedCrypto, setSelectedCrypto] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState("");

  const calculateTotalWithFee = () => {
    if (paymentMethod === 'crypto') {
      const fee = (BASE_PRICE * CRYPTO_FEE_PERCENTAGE) / 100;
      return BASE_PRICE + fee;
    }
    return BASE_PRICE;
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Пожалуйста, войдите в систему для совершения оплаты",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (paymentMethod === 'crypto' && !selectedCrypto) {
      toast({
        title: "Выберите криптовалюту",
        description: "Пожалуйста, выберите криптовалюту для оплаты",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([{
          user_id: user.id,
          amount: calculateTotalWithFee(),
          payment_method: paymentMethod === 'card' ? 'card' : selectedCrypto,
          metadata: paymentMethod === 'card' 
            ? { cardName, lastFourDigits: cardNumber.slice(-4) }
            : { walletAddress, cryptocurrency: selectedCrypto },
        }])
        .select()
        .single();

      if (paymentError) throw paymentError;

      const { error: battlePassError } = await supabase
        .from('user_battle_passes')
        .update({ is_premium: true })
        .eq('user_id', user.id);

      if (battlePassError) throw battlePassError;

      toast({
        title: "Оплата успешна",
        description: "Премиум статус активирован",
      });

      navigate("/");
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Ошибка оплаты",
        description: "Пожалуйста, попробуйте позже",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-colizeum-dark text-white pt-24">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Премиум Боевой Пропуск
          </h1>
          <p className="text-gray-400">
            Разблокируйте все премиум награды и возможности
          </p>
        </div>

        <Card className="bg-colizeum-gray border-colizeum-cyan/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Премиум Доступ</span>
              <span className="text-colizeum-cyan">
                {calculateTotalWithFee()} ₽
                {paymentMethod === 'crypto' && (
                  <span className="text-sm text-gray-400 ml-2">(включая 5% комиссию)</span>
                )}
              </span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Единоразовая оплата за текущий сезон
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-colizeum-cyan" />
                <span>Доступ ко всем премиум наградам</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-colizeum-cyan" />
                <span>Ускоренный прогресс</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-colizeum-cyan" />
                <span>Эксклюзивные возможности</span>
              </div>
            </div>

            <Tabs defaultValue="card" className="w-full" onValueChange={(value) => setPaymentMethod(value as 'card' | 'crypto')}>
              <TabsList className="w-full">
                <TabsTrigger value="card" className="flex-1">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Банковская карта
                </TabsTrigger>
                <TabsTrigger value="crypto" className="flex-1">
                  <Bitcoin className="w-4 h-4 mr-2" />
                  Криптовалюта
                </TabsTrigger>
              </TabsList>

              <TabsContent value="card" className="space-y-4 mt-4">
                <Input
                  placeholder="Номер карты"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="bg-colizeum-dark"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="bg-colizeum-dark"
                  />
                  <Input
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="bg-colizeum-dark"
                    type="password"
                    maxLength={3}
                  />
                </div>
                <Input
                  placeholder="Имя держателя карты"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="bg-colizeum-dark"
                />
              </TabsContent>

              <TabsContent value="crypto" className="space-y-4 mt-4">
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
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button 
              className="w-full bg-gradient-to-r from-colizeum-red to-colizeum-cyan hover:opacity-90 transition-opacity"
              size="lg"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? "Обработка..." : `Оплатить ${calculateTotalWithFee()} ₽`}
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-colizeum-cyan text-colizeum-cyan hover:bg-colizeum-cyan/10"
              asChild
            >
              <Link to="/">
                Вернуться назад
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>
            Оплата безопасно обрабатывается через защищенное соединение.
            <br />
            После оплаты доступ будет активирован автоматически.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pay;

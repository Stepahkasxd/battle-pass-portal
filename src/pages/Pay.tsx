import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Bitcoin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PremiumBenefits } from "@/components/payment/PremiumBenefits";
import { CardPaymentForm } from "@/components/payment/CardPaymentForm";
import { CryptoPaymentForm } from "@/components/payment/CryptoPaymentForm";
import { PaymentHeader } from "@/components/payment/PaymentHeader";
import { PaymentFooter } from "@/components/payment/PaymentFooter";
import { PaymentActions } from "@/components/payment/PaymentActions";

const BASE_PRICE = 49900; // 499.00 in cents
const CRYPTO_FEE_PERCENTAGE = 5;
const PAYMENT_VERIFICATION_TIMEOUT = 15000; // 15 seconds

const Pay = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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
      const fee = Math.floor((BASE_PRICE * CRYPTO_FEE_PERCENTAGE) / 100);
      return BASE_PRICE + fee;
    }
    return BASE_PRICE;
  };

  // Convert cents to display amount
  const getDisplayAmount = () => {
    return (calculateTotalWithFee() / 100).toFixed(2);
  };

  const handleVerifyPayment = async () => {
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Пожалуйста, войдите в систему для совершения оплаты",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsVerifying(true);

    // Simulate payment verification
    setTimeout(async () => {
      try {
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .insert([{
            user_id: user.id,
            amount: calculateTotalWithFee(), // Now sending integer amount
            payment_method: selectedCrypto,
            status: 'completed',
            metadata: { walletAddress, cryptocurrency: selectedCrypto },
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
          title: "Оплата подтверждена",
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
        setIsVerifying(false);
      }
    }, PAYMENT_VERIFICATION_TIMEOUT);
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
          amount: calculateTotalWithFee(), // Now sending integer amount
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
        <PaymentHeader />

        <Card className="bg-colizeum-gray border-colizeum-cyan/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Премиум Доступ</span>
              <span className="text-colizeum-cyan">
                {getDisplayAmount()} ₽
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
            <PremiumBenefits />

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

              <TabsContent value="card" className="mt-4">
                <CardPaymentForm
                  cardNumber={cardNumber}
                  setCardNumber={setCardNumber}
                  expiryDate={expiryDate}
                  setExpiryDate={setExpiryDate}
                  cvv={cvv}
                  setCvv={setCvv}
                  cardName={cardName}
                  setCardName={setCardName}
                />
              </TabsContent>

              <TabsContent value="crypto" className="mt-4">
                <CryptoPaymentForm
                  selectedCrypto={selectedCrypto}
                  setSelectedCrypto={setSelectedCrypto}
                  walletAddress={walletAddress}
                  setWalletAddress={setWalletAddress}
                  amount={Number(getDisplayAmount())}
                  onVerifyPayment={handleVerifyPayment}
                  isVerifying={isVerifying}
                />
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <PaymentActions 
              isProcessing={isProcessing}
              onPayment={handlePayment}
              showPayButton={paymentMethod === 'card'}
              amount={Number(getDisplayAmount())}
            />
          </CardFooter>
        </Card>

        <PaymentFooter />
      </div>
    </div>
  );
};

export default Pay;
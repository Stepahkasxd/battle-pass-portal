import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PaymentActionsProps {
  isProcessing: boolean;
  onPayment: () => void;
  showPayButton: boolean;
  amount: number;
}

export const PaymentActions = ({ 
  isProcessing, 
  onPayment, 
  showPayButton,
  amount 
}: PaymentActionsProps) => {
  return (
    <div className="flex flex-col gap-4">
      {showPayButton && (
        <Button 
          className="w-full bg-gradient-to-r from-colizeum-red to-colizeum-cyan hover:opacity-90 transition-opacity"
          size="lg"
          onClick={onPayment}
          disabled={isProcessing}
        >
          {isProcessing ? "Обработка..." : `Оплатить ${amount} ₽`}
        </Button>
      )}
      <Button 
        variant="outline" 
        className="w-full border-colizeum-cyan text-colizeum-cyan hover:bg-colizeum-cyan/10"
        asChild
      >
        <Link to="/">
          Вернуться назад
        </Link>
      </Button>
    </div>
  );
};
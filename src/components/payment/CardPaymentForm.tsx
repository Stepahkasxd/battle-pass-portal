import { Input } from "@/components/ui/input";

interface CardPaymentFormProps {
  cardNumber: string;
  setCardNumber: (value: string) => void;
  expiryDate: string;
  setExpiryDate: (value: string) => void;
  cvv: string;
  setCvv: (value: string) => void;
  cardName: string;
  setCardName: (value: string) => void;
}

export const CardPaymentForm = ({
  cardNumber,
  setCardNumber,
  expiryDate,
  setExpiryDate,
  cvv,
  setCvv,
  cardName,
  setCardName,
}: CardPaymentFormProps) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};
import { Shield, Star, Zap } from "lucide-react";

export const PremiumBenefits = () => {
  return (
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
  );
};
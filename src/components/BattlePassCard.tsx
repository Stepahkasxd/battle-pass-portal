import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, ChevronRight } from "lucide-react";

interface Reward {
  id: string;
  name: string;
  description: string | null;
  reward_type: string;
  required_level: number;
  is_premium: boolean;
}

interface BattlePassCardProps {
  level: number;
  currentXP: number;
  requiredXP: number;
  isPremium: boolean;
  name: string;
  description: string | null;
  rewards: Reward[];
}

export const BattlePassCard = ({ 
  level, 
  currentXP, 
  requiredXP, 
  isPremium,
  name,
  description,
  rewards 
}: BattlePassCardProps) => {
  const progress = (currentXP / requiredXP) * 100;
  const nextReward = rewards?.find(r => r.required_level > level);

  return (
    <Card className="w-full p-6 bg-colizeum-gray border-colizeum-cyan/20 animate-fade-in group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-colizeum-dark rounded-lg">
            <Trophy className="w-6 h-6 text-colizeum-cyan animate-levitate" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{name}</h3>
            <p className="text-sm text-gray-400">
              {isPremium ? "Премиум Пропуск Активен" : "Бесплатный Пропуск"}
            </p>
          </div>
        </div>
        <ChevronRight className="w-6 h-6 text-colizeum-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <div className="space-y-4">
        <p className="text-gray-400">{description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Уровень {level}</span>
            <span className="text-gray-400">{currentXP}/{requiredXP} XP</span>
          </div>
          <Progress value={progress} className="h-2 bg-colizeum-dark" />
        </div>

        {nextReward && (
          <div className="mt-4 p-3 bg-colizeum-dark rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Следующая награда</p>
                <p className="text-white font-medium">{nextReward.name}</p>
              </div>
              {nextReward.is_premium && (
                <Star className="w-5 h-5 text-colizeum-cyan" />
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
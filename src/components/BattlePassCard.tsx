import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

interface BattlePassCardProps {
  level: number;
  currentXP: number;
  requiredXP: number;
  isPremium: boolean;
}

export const BattlePassCard = ({ level, currentXP, requiredXP, isPremium }: BattlePassCardProps) => {
  const progress = (currentXP / requiredXP) * 100;

  return (
    <Card className="w-full p-6 bg-colizeum-gray border-colizeum-cyan/20 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-colizeum-dark rounded-lg">
            <Trophy className="w-6 h-6 text-colizeum-cyan animate-levitate" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Battle Pass Level {level}</h3>
            <p className="text-sm text-gray-400">
              {isPremium ? "Premium Pass Active" : "Free Pass"}
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Progress to Next Level</span>
          <span>{currentXP}/{requiredXP} XP</span>
        </div>
        <Progress value={progress} className="h-2 bg-colizeum-dark" />
      </div>
    </Card>
  );
};
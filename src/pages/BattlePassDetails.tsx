import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Gift, ChevronLeft, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { logAction } from "@/lib/logger";

const BattlePassDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: battlePass, isLoading: isLoadingBattlePass } = useQuery({
    queryKey: ['battlePass', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_passes')
        .select(`
          *,
          user_battle_passes!inner (
            current_level,
            current_xp,
            is_premium
          ),
          rewards (
            id,
            name,
            description,
            reward_type,
            required_level,
            is_premium
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const { data: userRewards, refetch: refetchUserRewards } = useQuery({
    queryKey: ['userRewards', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_rewards')
        .select('reward_id')
        .eq('user_id', user?.id);

      if (error) throw error;
      return data.map(r => r.reward_id);
    },
    enabled: !!user,
  });

  const claimReward = async (rewardId: string, rewardName: string) => {
    const { error } = await supabase
      .from('user_rewards')
      .insert([
        {
          user_id: user?.id,
          reward_id: rewardId,
        }
      ]);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось получить награду",
        variant: "destructive",
      });
      return;
    }

    // Log the reward claim with detailed information
    await logAction(
      "reward_create",
      `Получена награда: ${rewardName}`,
      {
        reward_id: rewardId,
        claimed_at: new Date().toISOString(),
      },
      user?.id
    );

    toast({
      title: "Успех!",
      description: "Награда успешно получена",
    });

    // Обновляем кэш для списка наград пользователя
    await refetchUserRewards();
    // Также обновляем кэш для страницы наград
    await queryClient.invalidateQueries({ queryKey: ['userRewardsDetails'] });
  };

  if (isLoadingBattlePass) {
    return (
      <div className="min-h-screen bg-colizeum-dark p-4 pt-24">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-colizeum-gray rounded w-1/4"></div>
            <div className="h-4 bg-colizeum-gray rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-colizeum-gray rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!battlePass) return null;

  const currentLevel = battlePass.user_battle_passes[0].current_level;
  const currentXP = battlePass.user_battle_passes[0].current_xp;
  const isPremium = battlePass.user_battle_passes[0].is_premium;
  const progress = (currentXP / 1000) * 100;

  return (
    <div className="min-h-screen bg-colizeum-dark p-4 pt-24">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-colizeum-cyan hover:text-colizeum-cyan/80 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Назад к списку пропусков
        </Link>

        <div className="mb-8 animate-fade-in">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-colizeum-gray rounded-lg">
              <Trophy className="w-8 h-8 text-colizeum-cyan animate-levitate" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{battlePass.name}</h1>
              <p className="text-gray-400">{battlePass.description}</p>
            </div>
          </div>

          <div className="bg-colizeum-gray rounded-lg p-6 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white">Уровень {currentLevel}</span>
              <span className="text-gray-400">{currentXP}/1000 XP</span>
            </div>
            <Progress value={progress} className="h-2 bg-colizeum-dark" />
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {battlePass.rewards
          .sort((a, b) => a.required_level - b.required_level)
          .map((reward) => {
            const isUnlocked = currentLevel >= reward.required_level;
            const isClaimed = userRewards?.includes(reward.id);
            const canClaim = isUnlocked && !isClaimed && (!reward.is_premium || isPremium);

            return (
              <Card 
                key={reward.id}
                className={`bg-colizeum-gray border-colizeum-cyan/20 p-6 animate-fade-in transition-transform hover:scale-[1.02] flex flex-col ${
                  !isUnlocked ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-colizeum-dark rounded-lg">
                    <Gift className="w-6 h-6 text-colizeum-cyan" />
                  </div>
                  {reward.is_premium && (
                    <Star className="w-5 h-5 text-colizeum-cyan" />
                  )}
                </div>

                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {reward.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {reward.description}
                  </p>
                </div>

                <div className="mt-auto space-y-2">
                  <div className="text-sm text-gray-400">
                    Требуемый уровень: {reward.required_level}
                  </div>
                  
                  {!isUnlocked ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Заблокировано
                    </Button>
                  ) : isClaimed ? (
                    <Button 
                      variant="outline" 
                      className="w-full bg-colizeum-cyan/10" 
                      disabled
                    >
                      Получено
                    </Button>
                  ) : reward.is_premium && !isPremium ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Требуется премиум
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-colizeum-cyan hover:bg-colizeum-cyan/80 text-colizeum-dark"
                      onClick={() => claimReward(reward.id, reward.name)}
                    >
                      Получить награду
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
};

export default BattlePassDetails;

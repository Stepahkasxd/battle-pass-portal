import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Gift, Award, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { logAction } from "@/lib/logger";

const UserRewards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['userRewardsDetails', user?.id],
    queryFn: async () => {
      // Получаем награды из боевого пропуска
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('user_rewards')
        .select(`
          *,
          rewards (
            name,
            description,
            reward_type,
            is_premium
          )
        `)
        .eq('user_id', user?.id);

      if (rewardsError) throw rewardsError;

      // Получаем покупки из магазина
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('user_purchases')
        .select(`
          *,
          shop_items (
            name,
            description,
            image_url
          )
        `)
        .eq('user_id', user?.id);

      if (purchasesError) throw purchasesError;

      // Объединяем данные
      const allRewards = [
        ...rewardsData.map((r: any) => ({
          ...r,
          type: 'battle_pass',
          name: r.rewards?.name,
          description: r.rewards?.description,
        })),
        ...purchasesData.map((p: any) => ({
          id: p.id,
          type: 'shop',
          name: p.shop_items?.name,
          description: p.shop_items?.description,
          image_url: p.shop_items?.image_url,
          claimed_at: p.purchased_at,
        })),
      ];

      return allRewards;
    },
    enabled: !!user,
  });

  const markAsReceived = useMutation({
    mutationFn: async (reward: any) => {
      if (reward.type === 'shop') {
        // Для покупок из магазина
        const { error } = await supabase
          .from('user_purchases')
          .delete()
          .eq('id', reward.id)
          .eq('user_id', user?.id);

        if (error) throw error;
        
        await logAction('reward_claimed', `Получена награда из магазина: ${reward.name}`);
      } else {
        // Для наград из боевого пропуска
        const { error } = await supabase
          .from('user_rewards')
          .delete()
          .eq('id', reward.id)
          .eq('user_id', user?.id);

        if (error) throw error;
        
        await logAction('reward_claimed', `Получена награда из боевого пропуска: ${reward.name}`);
      }
      return reward.id;
    },
    onSuccess: (rewardId) => {
      queryClient.invalidateQueries({ queryKey: ['userRewardsDetails', user?.id] });
      
      toast({
        title: "Успех!",
        description: "Награда отмечена как полученная",
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отметить награду как полученную",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-colizeum-dark p-4 pt-24">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-colizeum-gray rounded w-1/4"></div>
            <div className="h-48 bg-colizeum-gray rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-colizeum-dark p-4 pt-24">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
            Мои Награды
          </h1>
          <p className="text-gray-400 text-lg animate-fade-in delay-100">
            История полученных наград
          </p>
        </div>

        <ScrollArea className="h-[600px] rounded-md border border-colizeum-cyan/20 p-4">
          {rewards?.length ? (
            <div className="space-y-4">
              {rewards.map((reward: any) => (
                <Card 
                  key={reward.id}
                  className="bg-colizeum-gray border-colizeum-cyan/20 hover:border-colizeum-cyan/40 transition-colors animate-fade-in"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-colizeum-dark rounded-lg">
                          {reward.type === 'shop' ? (
                            <ShoppingBag className="w-6 h-6 text-colizeum-cyan animate-pulse" />
                          ) : (
                            <Award className="w-6 h-6 text-colizeum-cyan animate-pulse" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">
                            {reward.name}
                          </CardTitle>
                          <p className="text-sm text-gray-400">
                            {reward.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="bg-colizeum-cyan/10 hover:bg-colizeum-cyan/20 border-colizeum-cyan/20"
                        onClick={() => markAsReceived.mutate(reward)}
                      >
                        Получил
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>
                        {reward.type === 'shop' ? 'Покупка из магазина' : 'Награда из боевого пропуска'}
                      </span>
                      <span>
                        Получено: {new Date(reward.claimed_at).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-colizeum-cyan mx-auto mb-4 animate-levitate" />
              <h3 className="text-xl font-bold text-white mb-2">
                У вас пока нет наград
              </h3>
              <p className="text-gray-400">
                Выполняйте задания и получайте награды в боевом пропуске
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default UserRewards;
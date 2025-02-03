import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Gift, Award } from "lucide-react";

const UserRewards = () => {
  const { user } = useAuth();

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['userRewardsDetails', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
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
        .eq('user_id', user?.id)
        .order('claimed_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
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
              {rewards.map((reward) => (
                <Card 
                  key={reward.id}
                  className="bg-colizeum-gray border-colizeum-cyan/20 hover:border-colizeum-cyan/40 transition-colors animate-fade-in"
                >
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-colizeum-dark rounded-lg">
                        <Award className="w-6 h-6 text-colizeum-cyan animate-pulse" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">
                          {reward.rewards?.name}
                        </CardTitle>
                        <p className="text-sm text-gray-400">
                          {reward.rewards?.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>ID награды: {reward.reward_id}</span>
                      <span>Получено: {new Date(reward.claimed_at).toLocaleString()}</span>
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
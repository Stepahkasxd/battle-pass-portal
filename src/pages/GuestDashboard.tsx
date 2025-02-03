import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Target, ArrowRight, Award, Gift, History, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BattlePassCard } from "@/components/BattlePassCard";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const GuestDashboard = () => {
  const { user } = useAuth();

  const { data: activeBattlePasses } = useQuery({
    queryKey: ['activeBattlePasses'],
    queryFn: async () => {
      const now = new Date().toISOString();
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
        .gte('end_date', now)
        .lte('start_date', now);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: userRewards } = useQuery({
    queryKey: ['userRewards'],
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

  return (
    <div className="min-h-screen bg-colizeum-dark p-4 pt-24">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
            Личный кабинет
          </h1>
          <p className="text-gray-400 text-lg animate-fade-in delay-100">
            Управляйте своими боевыми пропусками и наградами
          </p>
        </div>

        <Tabs defaultValue="battle-passes" className="space-y-6">
          <TabsList className="bg-colizeum-gray border border-colizeum-cyan/20 p-1">
            <TabsTrigger value="battle-passes" className="data-[state=active]:bg-colizeum-cyan data-[state=active]:text-colizeum-dark">
              <Trophy className="w-4 h-4 mr-2" />
              Боевые пропуски
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-colizeum-cyan data-[state=active]:text-colizeum-dark">
              <Gift className="w-4 h-4 mr-2" />
              История наград
            </TabsTrigger>
          </TabsList>

          <TabsContent value="battle-passes" className="space-y-6">
            {activeBattlePasses?.length ? (
              activeBattlePasses.map((bp) => (
                <Link to={`/battle-pass/${bp.id}`} key={bp.id} className="block transition-transform hover:scale-[1.02]">
                  <BattlePassCard
                    level={bp.user_battle_passes[0].current_level}
                    currentXP={bp.user_battle_passes[0].current_xp}
                    requiredXP={1000}
                    isPremium={bp.user_battle_passes[0].is_premium}
                    name={bp.name}
                    description={bp.description}
                    rewards={bp.rewards}
                  />
                </Link>
              ))
            ) : (
              <Card className="bg-colizeum-gray border-colizeum-cyan/20">
                <CardHeader className="text-center">
                  <Trophy className="w-12 h-12 text-colizeum-cyan mx-auto mb-4 animate-levitate" />
                  <CardTitle className="text-white">Нет активных боевых пропусков</CardTitle>
                  <CardDescription className="text-gray-400">
                    Приобретите боевой пропуск, чтобы начать получать награды
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <ScrollArea className="h-[500px] rounded-md border border-colizeum-cyan/20 p-4">
              {userRewards?.length ? (
                userRewards.map((reward) => (
                  <Card key={reward.id} className="bg-colizeum-gray border-colizeum-cyan/20 mb-4 hover:border-colizeum-cyan/40 transition-colors">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-colizeum-dark rounded-lg">
                          <Award className="w-6 h-6 text-colizeum-cyan animate-pulse" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">
                            {reward.rewards?.name}
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            {reward.rewards?.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Получено: {new Date(reward.claimed_at).toLocaleDateString()}</span>
                        {reward.rewards?.is_premium && (
                          <span className="flex items-center">
                            <Star className="w-4 h-4 text-colizeum-cyan mr-1" />
                            Премиум награда
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-colizeum-cyan mx-auto mb-4 animate-levitate" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    История наград пуста
                  </h3>
                  <p className="text-gray-400">
                    Выполняйте задания и получайте награды в боевом пропуске
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GuestDashboard;
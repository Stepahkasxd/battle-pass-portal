import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Gift, User, Settings, Award, Key, ChevronRight, History } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BattlePassCard } from "@/components/BattlePassCard";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const GuestDashboard = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

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
            id,
            name,
            description,
            reward_type,
            required_level,
            is_premium
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const form = useForm({
    defaultValues: {
      display_name: profile?.display_name || '',
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onUpdateProfile = async (values: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: values.display_name })
        .eq('id', user?.id);

      if (error) throw error;

      if (values.new_password && values.current_password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: values.new_password,
        });

        if (passwordError) throw passwordError;
      }

      toast.success('Профиль успешно обновлен');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-colizeum-dark p-4 pt-24">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
                Привет, {profile?.display_name || 'Игрок'}!
              </h1>
              <p className="text-gray-400 text-lg animate-fade-in delay-100">
                Управляйте своими боевыми пропусками и наградами
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Card className="bg-colizeum-gray border-colizeum-cyan/20">
                <CardContent className="p-4 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-colizeum-cyan" />
                  <div>
                    <p className="text-sm text-gray-400">Очки</p>
                    <p className="text-xl font-bold text-white">{profile?.points || 0}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-colizeum-cyan/20">
                    <Settings className="w-5 h-5 mr-2" />
                    Настройки
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-colizeum-gray border-colizeum-cyan/20">
                  <DialogHeader>
                    <DialogTitle className="text-white">Настройки профиля</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onUpdateProfile)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="display_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Отображаемое имя</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-colizeum-darker border-colizeum-cyan/20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-4">
                        <h4 className="text-white font-medium">Сменить пароль</h4>
                        <FormField
                          control={form.control}
                          name="current_password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Текущий пароль</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} className="bg-colizeum-darker border-colizeum-cyan/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="new_password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Новый пароль</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} className="bg-colizeum-darker border-colizeum-cyan/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="pt-4 border-t border-colizeum-cyan/20">
                        <p className="text-sm text-gray-400 mb-2">ID пользователя</p>
                        <code className="block p-2 bg-colizeum-darker rounded text-sm text-colizeum-cyan">
                          {profile?.numeric_id}
                        </code>
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" className="bg-colizeum-cyan text-colizeum-dark hover:bg-colizeum-cyan/90">
                          Сохранить
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
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
                  <Gift className="w-12 h-12 text-colizeum-cyan mx-auto mb-4 animate-levitate" />
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

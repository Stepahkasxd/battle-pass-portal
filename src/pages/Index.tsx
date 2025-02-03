import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BattlePassCard } from "@/components/BattlePassCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Star, Gift, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: battlePasses, isLoading } = useQuery({
    queryKey: ['publicBattlePasses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_passes')
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
        .order('created_at', { ascending: false })
        .limit(2);

      if (error) throw error;
      return data;
    },
  });

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для покупки премиум пропуска необходимо войти в аккаунт",
      });
      navigate("/auth");
      return;
    }
    navigate("/pay");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-colizeum-dark text-white">
        <main className="container mx-auto px-4 pt-24">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-colizeum-gray rounded w-1/4"></div>
              <div className="h-4 bg-colizeum-gray rounded w-1/2"></div>
              <div className="h-64 bg-colizeum-gray rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const freeBattlePass = battlePasses?.find(bp => !bp.is_premium);
  const premiumBattlePass = battlePasses?.find(bp => bp.is_premium);

  return (
    <div className="min-h-screen bg-colizeum-dark text-white">
      <main className="container mx-auto px-4 pt-24">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
              Добро пожаловать в{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-colizeum-red to-colizeum-cyan">
                Colizeum Battle Pass
              </span>
            </h1>
            <p className="text-gray-400">
              Выполняйте миссии, получайте награды, повышайте уровень
            </p>
          </div>

          {freeBattlePass && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Бесплатный Боевой Пропуск</h2>
              <BattlePassCard
                level={1}
                currentXP={0}
                requiredXP={1000}
                isPremium={false}
                name={freeBattlePass.name}
                description={freeBattlePass.description}
                rewards={freeBattlePass.rewards}
              />
            </div>
          )}

          {premiumBattlePass && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  Премиум Боевой Пропуск
                  <Star className="w-5 h-5 text-colizeum-cyan" />
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-colizeum-cyan">499 ₽</span>
                  <Button
                    onClick={handlePurchase}
                    className="bg-gradient-to-r from-colizeum-red to-colizeum-cyan hover:opacity-90 transition-opacity"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Купить
                  </Button>
                </div>
              </div>
              <BattlePassCard
                level={1}
                currentXP={0}
                requiredXP={1000}
                isPremium={true}
                name={premiumBattlePass.name}
                description={premiumBattlePass.description}
                rewards={premiumBattlePass.rewards}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-colizeum-gray border-colizeum-cyan/20">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-colizeum-dark rounded-lg">
                  <Trophy className="w-8 h-8 text-colizeum-cyan" />
                </div>
                <h3 className="text-lg font-semibold">Уникальные награды</h3>
                <p className="text-gray-400">
                  Получайте эксклюзивные награды за выполнение миссий
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-colizeum-gray border-colizeum-cyan/20">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-colizeum-dark rounded-lg">
                  <Star className="w-8 h-8 text-colizeum-cyan" />
                </div>
                <h3 className="text-lg font-semibold">Премиум преимущества</h3>
                <p className="text-gray-400">
                  Получите доступ к премиум наградам и дополнительным возможностям
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-colizeum-gray border-colizeum-cyan/20">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-colizeum-dark rounded-lg">
                  <Gift className="w-8 h-8 text-colizeum-cyan" />
                </div>
                <h3 className="text-lg font-semibold">Ежедневные миссии</h3>
                <p className="text-gray-400">
                  Выполняйте ежедневные миссии для получения опыта и наград
                </p>
              </div>
            </Card>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-colizeum-red to-colizeum-cyan hover:opacity-90 transition-opacity"
              asChild
            >
              <Link to="/auth">Начать игру</Link>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-colizeum-cyan text-colizeum-cyan hover:bg-colizeum-cyan/10"
              asChild
            >
              <Link to="/shop">Магазин</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
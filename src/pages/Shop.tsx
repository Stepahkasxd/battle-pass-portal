import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { logAction } from "@/lib/logger";

const Shop = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: shopItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ['shopItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handlePurchase = async (item: any) => {
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Пожалуйста, войдите в систему для совершения покупок",
        variant: "destructive",
      });
      return;
    }

    if (!userProfile || userProfile.points < item.price) {
      toast({
        title: "Недостаточно очков",
        description: "У вас недостаточно очков для покупки этого товара",
        variant: "destructive",
      });
      return;
    }

    try {
      // Создаем запись о покупке
      const { error: purchaseError } = await supabase
        .from('user_purchases')
        .insert({
          user_id: user.id,
          item_id: item.id,
          price_paid: item.price,
        });

      if (purchaseError) throw purchaseError;

      // Обновляем баланс пользователя
      const { error: pointsError } = await supabase
        .from('profiles')
        .update({ points: userProfile.points - item.price })
        .eq('id', user.id);

      if (pointsError) throw pointsError;

      // Создаем запись о награде
      const { error: rewardError } = await supabase
        .from('user_rewards')
        .insert({
          user_id: user.id,
          reward_id: item.id,
        });

      if (rewardError) throw rewardError;

      await logAction('item_purchase', `Покупка товара: ${item.name}`);

      toast({
        title: "Успешная покупка!",
        description: `Вы приобрели ${item.name}. Проверьте вкладку "Мои Награды" для получения.`,
      });

    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось совершить покупку",
        variant: "destructive",
      });
    }
  };

  if (isLoadingItems || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-colizeum-dark pt-24">
        <div className="container mx-auto px-4">
          <div className="text-white">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-colizeum-dark pt-24">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Магазин</h1>
          {user && userProfile && (
            <div className="text-colizeum-cyan font-semibold">
              Доступно очков: {userProfile.points}
            </div>
          )}
        </div>

        {!user && (
          <Card className="mb-8 border-yellow-600/50 bg-yellow-600/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle className="w-5 h-5" />
                <span>Войдите в систему, чтобы совершать покупки</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopItems?.map((item) => (
            <Card key={item.id} className="bg-colizeum-dark border-colizeum-gray">
              <CardHeader>
                <CardTitle className="text-white">{item.name}</CardTitle>
              </CardHeader>
              {item.image_url && (
                <CardContent>
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-md"
                  />
                </CardContent>
              )}
              <CardContent>
                <p className="text-gray-400">{item.description}</p>
                <div className="mt-4 text-xl font-bold text-colizeum-cyan">
                  {item.price} очков
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handlePurchase(item)}
                  disabled={!user || (userProfile && userProfile.points < item.price)}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Купить
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {shopItems?.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            В магазине пока нет доступных товаров
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
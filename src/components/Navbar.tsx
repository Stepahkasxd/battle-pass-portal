import { Button } from "@/components/ui/button";
import { Trophy, User, ShoppingCart, Shield, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Navbar = () => {
  const { user } = useAuth();

  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!user || user.email !== 'malsyswap@gmail.com') {
        return false;
      }
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .single();
      return !!adminUser;
    },
    enabled: !!user,
  });

  const { data: rewardsCount } = useQuery({
    queryKey: ['userRewardsCount', user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('user_rewards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
      return count || 0;
    },
    enabled: !!user,
  });

  return (
    <nav className="fixed top-0 w-full bg-colizeum-dark/95 backdrop-blur-sm border-b border-colizeum-gray z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-white">COLIZEUM</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/battlepass">
            <Button variant="ghost" className="text-gray-400 hover:text-colizeum-cyan">
              <Trophy className="w-5 h-5 mr-2" />
              Боевой Пропуск
            </Button>
          </Link>
          
          <Link to="/shop">
            <Button variant="ghost" className="text-gray-400 hover:text-colizeum-cyan">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Магазин
            </Button>
          </Link>
          
          {user ? (
            <>
              <Link to="/rewards">
                <Button variant="ghost" className="text-gray-400 hover:text-colizeum-cyan relative">
                  <Gift className="w-5 h-5 mr-2" />
                  Мои Награды
                  {rewardsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-colizeum-cyan text-colizeum-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                      {rewardsCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" className="text-gray-400 hover:text-colizeum-cyan">
                  <User className="w-5 h-5 mr-2" />
                  Профиль
                </Button>
              </Link>
              {isAdmin && user.email === 'malsyswap@gmail.com' && (
                <Link to="/admin">
                  <Button variant="ghost" className="text-gray-400 hover:text-colizeum-cyan">
                    <Shield className="w-5 h-5 mr-2" />
                    Админ
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" className="text-gray-400 hover:text-colizeum-cyan">
                <User className="w-5 h-5 mr-2" />
                Войти
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
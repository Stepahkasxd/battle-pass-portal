import { Button } from "@/components/ui/button";
import { Trophy, User, ShoppingCart, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Navbar = () => {
  const { user } = useAuth();

  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .single();
      return !!adminUser;
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
            <Button variant="ghost" className="text-white hover:text-colizeum-cyan">
              <Trophy className="w-5 h-5 mr-2" />
              Боевой Пропуск
            </Button>
          </Link>
          
          <Link to="/shop">
            <Button variant="ghost" className="text-white hover:text-colizeum-cyan">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Магазин
            </Button>
          </Link>
          
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="text-white hover:text-colizeum-cyan">
                  <User className="w-5 h-5 mr-2" />
                  Профиль
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" className="text-white hover:text-colizeum-cyan">
                    <Shield className="w-5 h-5 mr-2" />
                    Админ
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" className="text-white hover:text-colizeum-cyan">
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
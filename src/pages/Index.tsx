
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();

  const { data: battlePass, isLoading } = useQuery({
    queryKey: ['currentBattlePass'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_passes')
        .select('*')
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
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
        <Card className="bg-colizeum 3-gray border-colizeum-cyan/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-colizeum-cyan" />
              <span>Добро пожаловать в Colizeum</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400">
              Участвуйте в битвах, зарабатывайте награды и станьте лучшим в нашем сообществе!
            </p>
            {user ? (
              <div className="space-y-4">
                <Link to="/dashboard">
                  <Button className="w-full">
                    Перейти в личный кабинет
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <Link to="/auth">
                  <Button className="w-full">
                    Войти или зарегистрироваться
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BattlePassCard } from "@/components/BattlePassCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Trophy, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  username: string;
  avatar_url: string | null;
}

interface UserBattlePass {
  current_level: number;
  current_xp: number;
  is_premium: boolean;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [battlePass, setBattlePass] = useState<UserBattlePass | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
        return;
      }

      setProfile(data);
    };

    const fetchBattlePass = async () => {
      const { data, error } = await supabase
        .from("user_battle_passes")
        .select("current_level, current_xp, is_premium")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        toast({
          title: "Error",
          description: "Failed to load battle pass progress",
          variant: "destructive",
        });
        return;
      }

      setBattlePass(data);
    };

    fetchProfile();
    fetchBattlePass();
  }, [user, navigate, toast]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
      return;
    }
    navigate("/auth");
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <Card className="max-w-4xl mx-auto p-6 bg-colizeum-gray border-colizeum-cyan/20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="text-white hover:text-colizeum-cyan"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Выйти
          </Button>
        </div>

        {battlePass ? (
          <BattlePassCard
            level={battlePass.current_level}
            currentXP={battlePass.current_xp}
            requiredXP={1000} // This should be calculated based on level
            isPremium={battlePass.is_premium}
          />
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-colizeum-cyan mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Нет активного боевого пропуска
            </h3>
            <p className="text-gray-400 mb-4">
              Приобретите боевой пропуск, чтобы начать получать награды
            </p>
            <Button
              onClick={() => navigate("/battlepass")}
              className="bg-colizeum-cyan text-black hover:bg-colizeum-cyan/90"
            >
              Купить боевой пропуск
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Profile;
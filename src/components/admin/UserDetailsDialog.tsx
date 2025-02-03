import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { logAction } from "@/lib/logger";

interface UserDetailsDialogProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailsDialog = ({ userId, isOpen, onClose }: UserDetailsDialogProps) => {
  const { toast } = useToast();
  const [selectedBattlePass, setSelectedBattlePass] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: ['adminUserDetails', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: userBattlePasses, refetch: refetchUserBattlePasses } = useQuery({
    queryKey: ['userBattlePassesDetails', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_battle_passes')
        .select(`
          *,
          battle_passes (
            name,
            description
          )
        `)
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: availableBattlePasses } = useQuery({
    queryKey: ['availableBattlePasses', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_passes')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const handleAssignBattlePass = async () => {
    if (!userId || !selectedBattlePass) {
      toast({
        title: "Ошибка",
        description: "Выберите боевой пропуск",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('user_battle_passes')
      .insert([{
        user_id: userId,
        battle_pass_id: selectedBattlePass,
        current_level: 1,
        current_xp: 0,
        is_premium: false,
      }]);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выдать боевой пропуск",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "Боевой пропуск выдан",
      });
      refetchUserBattlePasses();
      setSelectedBattlePass(null);
    }
  };

  const handleUpdateBattlePass = async (battlePassId: string, field: 'current_level' | 'current_xp' | 'is_premium', value: number | boolean) => {
    const { error } = await supabase
      .from('user_battle_passes')
      .update({ [field]: value })
      .eq('user_id', userId)
      .eq('battle_pass_id', battlePassId);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить прогресс",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: field === 'is_premium' 
          ? `Премиум статус ${value ? 'включен' : 'выключен'}`
          : "Прогресс обновлен",
      });

      if (field === 'is_premium') {
        await logAction(
          "battle_pass_update",
          `${value ? 'Включен' : 'Выключен'} премиум статус для пользователя ${user?.username}`,
          { battle_pass_id: battlePassId, user_id: userId },
          userId
        );
      }

      refetchUserBattlePasses();
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Управление пользователем {user.username}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Выдать боевой пропуск</h3>
            <div className="flex gap-4">
              <select
                className="flex-1 p-2 rounded-md bg-colizeum-gray text-white border border-colizeum-cyan/20"
                value={selectedBattlePass || ''}
                onChange={(e) => setSelectedBattlePass(e.target.value || null)}
              >
                <option value="">Выберите боевой пропуск</option>
                {availableBattlePasses?.map((pass) => (
                  <option key={pass.id} value={pass.id}>{pass.name}</option>
                ))}
              </select>
              <Button onClick={handleAssignBattlePass}>
                <Plus className="w-4 h-4 mr-2" />
                Выдать
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Активные боевые пропуски</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Уровень</TableHead>
                  <TableHead>Опыт</TableHead>
                  <TableHead>Премиум</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userBattlePasses?.map((pass) => (
                  <TableRow key={pass.id}>
                    <TableCell>{pass.battle_passes?.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-20"
                          value={pass.current_level}
                          onChange={(e) => handleUpdateBattlePass(pass.battle_pass_id, 'current_level', parseInt(e.target.value))}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-20"
                          value={pass.current_xp}
                          onChange={(e) => handleUpdateBattlePass(pass.battle_pass_id, 'current_xp', parseInt(e.target.value))}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={pass.is_premium}
                        onCheckedChange={(checked) => handleUpdateBattlePass(pass.battle_pass_id, 'is_premium', checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Trophy className="w-5 h-5 text-colizeum-cyan" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
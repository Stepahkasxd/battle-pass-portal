import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Plus } from "lucide-react";

export const UserBattlePassesManager = () => {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedBattlePass, setSelectedBattlePass] = useState<string | null>(null);

  const { data: users } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: battlePasses } = useQuery({
    queryKey: ['battlePasses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_passes')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: userBattlePasses, refetch: refetchUserBattlePasses } = useQuery({
    queryKey: ['userBattlePasses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_battle_passes')
        .select(`
          *,
          profiles!user_battle_passes_user_id_fkey (
            username,
            numeric_id
          ),
          battle_passes!user_battle_passes_battle_pass_id_fkey (
            name,
            description
          )
        `);
      if (error) throw error;
      return data;
    },
  });

  const handleAssignBattlePass = async () => {
    if (!selectedUser || !selectedBattlePass) {
      toast({
        title: "Ошибка",
        description: "Выберите пользователя и боевой пропуск",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('user_battle_passes')
      .insert([{
        user_id: selectedUser,
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
      setSelectedUser(null);
      setSelectedBattlePass(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление боевыми пропусками пользователей</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Выдать боевой пропуск</h3>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label>Выберите пользователя</label>
              <select
                className="w-full p-2 rounded-md bg-colizeum-gray text-white border border-colizeum-cyan/20"
                value={selectedUser || ''}
                onChange={(e) => setSelectedUser(e.target.value || null)}
              >
                <option value="">Выберите пользователя</option>
                {users?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username} (ID: {user.numeric_id})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label>Выберите боевой пропуск</label>
              <select
                className="w-full p-2 rounded-md bg-colizeum-gray text-white border border-colizeum-cyan/20"
                value={selectedBattlePass || ''}
                onChange={(e) => setSelectedBattlePass(e.target.value || null)}
              >
                <option value="">Выберите боевой пропуск</option>
                {battlePasses?.map((pass) => (
                  <option key={pass.id} value={pass.id}>{pass.name}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleAssignBattlePass} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Выдать боевой пропуск
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Активные боевые пропуски</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>ID пользователя</TableHead>
                <TableHead>Боевой пропуск</TableHead>
                <TableHead>Уровень</TableHead>
                <TableHead>Опыт</TableHead>
                <TableHead>Премиум</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userBattlePasses?.map((ubp) => (
                <TableRow key={ubp.id}>
                  <TableCell>{ubp.profiles?.username}</TableCell>
                  <TableCell>{ubp.profiles?.numeric_id}</TableCell>
                  <TableCell>{ubp.battle_passes?.name}</TableCell>
                  <TableCell>{ubp.current_level}</TableCell>
                  <TableCell>{ubp.current_xp}</TableCell>
                  <TableCell>{ubp.is_premium ? "Да" : "Нет"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, Activity, Trophy, Gift, Plus } from "lucide-react";
import { UserPointsManager } from "@/components/admin/UserPointsManager";

const AdminPanel = () => {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedBattlePass, setSelectedBattlePass] = useState<string | null>(null);

  const { data: users, refetch: refetchUsers } = useQuery({
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
    <div className="min-h-screen bg-colizeum-dark">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Панель администратора</h1>
        
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Логи
            </TabsTrigger>
            <TabsTrigger value="battle-passes" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Боевые пропуски
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Награды
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Выдать боевой пропуск</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label>Выберите пользователя</Label>
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
                        <Label>Выберите боевой пропуск</Label>
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
                    <h3 className="text-lg font-semibold">Список пользователей</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Имя пользователя</TableHead>
                          <TableHead>Очки</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-mono">{user.numeric_id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.points}</TableCell>
                            <TableCell>
                              <UserPointsManager
                                userId={user.id}
                                currentPoints={user.points}
                                onUpdate={refetchUsers}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Логи действий</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Время</TableHead>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Действие</TableHead>
                      <TableHead>Описание</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs?.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.created_at).toLocaleString('ru-RU')}</TableCell>
                        <TableCell>{log.profiles?.username || 'Система'}</TableCell>
                        <TableCell>{log.action_type}</TableCell>
                        <TableCell>{log.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="battle-passes">
            <Card>
              <CardHeader>
                <CardTitle>Боевые пропуски</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Создать новый боевой пропуск</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Название</Label>
                      <Input
                        id="name"
                        value={newBattlePass.name}
                        onChange={(e) => setNewBattlePass(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Описание</Label>
                      <Input
                        id="description"
                        value={newBattlePass.description}
                        onChange={(e) => setNewBattlePass(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Дата начала</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={newBattlePass.startDate}
                        onChange={(e) => setNewBattlePass(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">Дата окончания</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={newBattlePass.endDate}
                        onChange={(e) => setNewBattlePass(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleCreateBattlePass} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Создать боевой пропуск
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Существующие боевые пропуски</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Описание</TableHead>
                        <TableHead>Дата начала</TableHead>
                        <TableHead>Дата окончания</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {battlePasses?.map((pass) => (
                        <TableRow key={pass.id}>
                          <TableCell>{pass.name}</TableCell>
                          <TableCell>{pass.description}</TableCell>
                          <TableCell>{new Date(pass.start_date).toLocaleString('ru-RU')}</TableCell>
                          <TableCell>{new Date(pass.end_date).toLocaleString('ru-RU')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards">
            <Card>
              <CardHeader>
                <CardTitle>Награды</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Выдать награду</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="rewardName">Название награды</Label>
                      <Input
                        id="rewardName"
                        value={newReward.name}
                        onChange={(e) => setNewReward(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="rewardDescription">Описание награды</Label>
                      <Input
                        id="rewardDescription"
                        value={newReward.description}
                        onChange={(e) => setNewReward(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="requiredLevel">Требуемый уровень</Label>
                      <Input
                        id="requiredLevel"
                        type="number"
                        min="1"
                        value={newReward.requiredLevel}
                        onChange={(e) => setNewReward(prev => ({ ...prev, requiredLevel: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="rewardType">Тип награды</Label>
                      <select
                        id="rewardType"
                        className="w-full p-2 rounded-md bg-colizeum-gray text-white border border-colizeum-cyan/20"
                        value={newReward.rewardType}
                        onChange={(e) => setNewReward(prev => ({ ...prev, rewardType: e.target.value as "item" | "bonus" | "discount" }))}
                      >
                        <option value="item">Предмет</option>
                        <option value="bonus">Бонус</option>
                        <option value="discount">Скидка</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPremium"
                        checked={newReward.isPremium}
                        onChange={(e) => setNewReward(prev => ({ ...prev, isPremium: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="isPremium">Премиум награда</Label>
                    </div>
                    <Button onClick={handleCreateReward} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить награду
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Существующие награды</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Описание</TableHead>
                        <TableHead>Уровень</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Премиум</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rewards?.map((reward) => (
                        <TableRow key={reward.id}>
                          <TableCell>{reward.name}</TableCell>
                          <TableCell>{reward.description}</TableCell>
                          <TableCell>{reward.required_level}</TableCell>
                          <TableCell>{reward.reward_type}</TableCell>
                          <TableCell>{reward.is_premium ? "Да" : "Нет"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface NewReward {
  name: string;
  description: string;
  reward_type: "discount" | "bonus" | "item";
  required_level: number;
  is_premium: boolean;
}

interface NewBattlePass {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  rewards: NewReward[];
}

export const BattlePassManager = () => {
  const { toast } = useToast();
  const [newBattlePass, setNewBattlePass] = useState<NewBattlePass>({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    rewards: [],
  });

  const [newReward, setNewReward] = useState<NewReward>({
    name: "",
    description: "",
    reward_type: "item",
    required_level: 1,
    is_premium: false,
  });

  const { data: battlePasses, refetch: refetchBattlePasses } = useQuery({
    queryKey: ['adminBattlePasses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_passes')
        .select(`
          *,
          rewards (
            *
          )
        `);
      if (error) throw error;
      return data;
    },
  });

  const handleAddReward = () => {
    if (!newReward.name) {
      toast({
        title: "Ошибка",
        description: "Укажите название награды",
        variant: "destructive",
      });
      return;
    }

    setNewBattlePass(prev => ({
      ...prev,
      rewards: [...prev.rewards, newReward],
    }));

    setNewReward({
      name: "",
      description: "",
      reward_type: "item",
      required_level: 1,
      is_premium: false,
    });
  };

  const handleRemoveReward = (index: number) => {
    setNewBattlePass(prev => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index),
    }));
  };

  const handleCreateBattlePass = async () => {
    if (!newBattlePass.name || !newBattlePass.start_date || !newBattlePass.end_date) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    const { data: battlePass, error: battlePassError } = await supabase
      .from('battle_passes')
      .insert([{
        name: newBattlePass.name,
        description: newBattlePass.description,
        start_date: newBattlePass.start_date,
        end_date: newBattlePass.end_date,
      }])
      .select()
      .single();

    if (battlePassError) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать боевой пропуск",
        variant: "destructive",
      });
      return;
    }

    // Create rewards for the battle pass
    const { error: rewardsError } = await supabase
      .from('rewards')
      .insert(
        newBattlePass.rewards.map(reward => ({
          ...reward,
          battle_pass_id: battlePass.id,
        }))
      );

    if (rewardsError) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать награды",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Успешно",
      description: "Боевой пропуск создан",
    });

    setNewBattlePass({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      rewards: [],
    });

    refetchBattlePasses();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление боевыми пропусками</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Название пропуска"
              value={newBattlePass.name}
              onChange={(e) => setNewBattlePass(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Описание"
              value={newBattlePass.description}
              onChange={(e) => setNewBattlePass(prev => ({ ...prev, description: e.target.value }))}
            />
            <Input
              type="datetime-local"
              value={newBattlePass.start_date}
              onChange={(e) => setNewBattlePass(prev => ({ ...prev, start_date: e.target.value }))}
            />
            <Input
              type="datetime-local"
              value={newBattlePass.end_date}
              onChange={(e) => setNewBattlePass(prev => ({ ...prev, end_date: e.target.value }))}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Добавить награду</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Название награды"
                value={newReward.name}
                onChange={(e) => setNewReward(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Описание награды"
                value={newReward.description}
                onChange={(e) => setNewReward(prev => ({ ...prev, description: e.target.value }))}
              />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={newReward.reward_type}
                onChange={(e) => setNewReward(prev => ({ 
                  ...prev, 
                  reward_type: e.target.value as "discount" | "bonus" | "item"
                }))}
              >
                <option value="item">Предмет</option>
                <option value="discount">Скидка</option>
                <option value="bonus">Бонус</option>
              </select>
              <Input
                type="number"
                placeholder="Требуемый уровень"
                value={newReward.required_level}
                onChange={(e) => setNewReward(prev => ({ 
                  ...prev, 
                  required_level: parseInt(e.target.value) 
                }))}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newReward.is_premium}
                  onCheckedChange={(checked) => setNewReward(prev => ({ 
                    ...prev, 
                    is_premium: checked 
                  }))}
                />
                <span>Премиум награда</span>
              </div>
              <Button onClick={handleAddReward}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить награду
              </Button>
            </div>
          </div>

          {newBattlePass.rewards.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Награды</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Уровень</TableHead>
                    <TableHead>Премиум</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newBattlePass.rewards.map((reward, index) => (
                    <TableRow key={index}>
                      <TableCell>{reward.name}</TableCell>
                      <TableCell>{reward.reward_type}</TableCell>
                      <TableCell>{reward.required_level}</TableCell>
                      <TableCell>{reward.is_premium ? "Да" : "Нет"}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveReward(index)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Button onClick={handleCreateBattlePass} className="w-full">
            Создать боевой пропуск
          </Button>
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
                <TableHead>Кол-во наград</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {battlePasses?.map((pass) => (
                <TableRow key={pass.id}>
                  <TableCell>{pass.name}</TableCell>
                  <TableCell>{pass.description}</TableCell>
                  <TableCell>{new Date(pass.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(pass.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{pass.rewards?.length || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
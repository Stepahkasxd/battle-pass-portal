import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserPointsManagerProps {
  userId: string;
  currentPoints: number;
  onUpdate: () => void;
}

export const UserPointsManager = ({ userId, currentPoints, onUpdate }: UserPointsManagerProps) => {
  const { toast } = useToast();
  const [pointsToAdd, setPointsToAdd] = useState<number>(0);

  const handleUpdatePoints = async (operation: 'add' | 'subtract') => {
    const pointsChange = operation === 'add' ? pointsToAdd : -pointsToAdd;
    const newPoints = currentPoints + pointsChange;

    if (newPoints < 0) {
      toast({
        title: "Ошибка",
        description: "Количество очков не может быть отрицательным",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ points: newPoints })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить очки",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: `${operation === 'add' ? 'Добавлено' : 'Вычтено'} ${pointsToAdd} очков`,
      });
      setPointsToAdd(0);
      onUpdate();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="grid gap-2 flex-1">
          <Label>Количество очков</Label>
          <Input
            type="number"
            min="0"
            value={pointsToAdd}
            onChange={(e) => setPointsToAdd(Math.max(0, parseInt(e.target.value) || 0))}
          />
        </div>
        <div className="flex gap-2 pt-8">
          <Button onClick={() => handleUpdatePoints('add')} variant="default">
            <Plus className="w-4 h-4 mr-2" />
            Добавить
          </Button>
          <Button onClick={() => handleUpdatePoints('subtract')} variant="destructive">
            <Minus className="w-4 h-4 mr-2" />
            Вычесть
          </Button>
        </div>
      </div>
    </div>
  );
};
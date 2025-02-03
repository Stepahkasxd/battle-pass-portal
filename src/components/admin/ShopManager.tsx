import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { logAction } from "@/lib/logger";

export const ShopManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['shopItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const itemData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseInt(formData.get('price') as string),
      image_url: formData.get('image_url') as string,
      is_available: true,
    };

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('shop_items')
          .update(itemData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        
        await logAction('shop_item_update', `Обновлен товар: ${itemData.name}`);
        toast({
          title: "Успех",
          description: "Товар успешно обновлен",
        });
      } else {
        const { error } = await supabase
          .from('shop_items')
          .insert(itemData);
        
        if (error) throw error;
        
        await logAction('shop_item_create', `Создан новый товар: ${itemData.name}`);
        toast({
          title: "Успех",
          description: "Товар успешно добавлен",
        });
      }

      queryClient.invalidateQueries({ queryKey: ['shopItems'] });
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить товар",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (item: any) => {
    try {
      const { error } = await supabase
        .from('shop_items')
        .delete()
        .eq('id', item.id);
      
      if (error) throw error;
      
      await logAction('shop_item_delete', `Удален товар: ${item.name}`);
      queryClient.invalidateQueries({ queryKey: ['shopItems'] });
      toast({
        title: "Успех",
        description: "Товар успешно удален",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление товарами</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить товар
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Редактировать товар" : "Добавить новый товар"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingItem?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingItem?.description}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Цена (в очках)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  defaultValue={editingItem?.price}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">URL изображения</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  type="url"
                  defaultValue={editingItem?.image_url}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button type="submit">
                  {editingItem ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Загрузка...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.price} очков</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingItem(item);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
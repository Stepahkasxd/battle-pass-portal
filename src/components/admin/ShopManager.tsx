import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { logAction } from "@/lib/logger";

export const ShopManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileUpload = async (file: File) => {
    if (!file) return null;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('shop_items')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('shop_items')
        .getPublicUrl(filePath);

      return { path: filePath, url: publicUrl };
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить изображение",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const file = (formData.get('image') as File)?.size > 0 
      ? formData.get('image') as File 
      : null;

    try {
      let imageData = null;
      if (file) {
        imageData = await handleFileUpload(file);
        if (!imageData) return;
      }

      const itemData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseInt(formData.get('price') as string),
        image_url: imageData?.url || editingItem?.image_url,
        image_path: imageData?.path || editingItem?.image_path,
        is_available: true,
      };

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
      if (item.image_path) {
        const { error: storageError } = await supabase.storage
          .from('shop_items')
          .remove([item.image_path]);
        
        if (storageError) throw storageError;
      }

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
                <Label htmlFor="image">Изображение</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer"
                />
                {editingItem?.image_url && (
                  <div className="mt-2">
                    <img
                      src={editingItem.image_url}
                      alt={editingItem.name}
                      className="w-32 h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading && <Upload className="w-4 h-4 mr-2 animate-spin" />}
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
              <TableHead>Изображение</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                </TableCell>
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
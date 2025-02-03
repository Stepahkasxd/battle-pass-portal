import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export const PaymentsManager = () => {
  const { toast } = useToast();

  const { data: payments, refetch: refetchPayments } = useQuery({
    queryKey: ['adminPayments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          profiles (
            username,
            numeric_id
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleUpdateStatus = async (paymentId: string, newStatus: string) => {
    const { error } = await supabase
      .from('payments')
      .update({ status: newStatus })
      .eq('id', paymentId);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус платежа",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "Статус платежа обновлен",
      });
      refetchPayments();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление платежами</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Пользователь</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Метод</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments?.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono">{payment.id.slice(0, 8)}</TableCell>
                <TableCell>{payment.profiles?.username}</TableCell>
                <TableCell>{payment.amount} ₽</TableCell>
                <TableCell>{payment.payment_method}</TableCell>
                <TableCell>
                  <Badge 
                    className="cursor-pointer"
                    variant={payment.status === 'completed' ? 'default' : 'secondary'}
                    onClick={() => handleUpdateStatus(
                      payment.id, 
                      payment.status === 'pending' ? 'completed' : 'pending'
                    )}
                  >
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(payment.created_at).toLocaleString('ru-RU')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
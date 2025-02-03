import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Activity, Trophy } from "lucide-react";
import { UsersTable } from "@/components/admin/UsersTable";
import { UserDetailsDialog } from "@/components/admin/UserDetailsDialog";
import { BattlePassManager } from "@/components/admin/BattlePassManager";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!user || user.email !== 'malsyswap@gmail.com') {
        return false;
      }
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .single();
      return !!adminUser;
    },
  });

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

  const { data: logs } = useQuery({
    queryKey: ['actionLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('action_logs')
        .select(`
          *,
          profiles (
            username
          )
        `);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!user || !isAdmin || user.email !== 'malsyswap@gmail.com') {
      navigate('/');
    }
  }, [isAdmin, navigate, user]);

  if (!isAdmin || !user || user.email !== 'malsyswap@gmail.com') {
    return null;
  }

  return (
    <div className="min-h-screen bg-colizeum-dark p-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-8 text-white">Панель администратора</h1>
        
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="battle-pass" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Боевой пропуск
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Логи
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
              </CardHeader>
              <CardContent>
                <UsersTable 
                  users={users || []} 
                  onUserClick={setSelectedUserId}
                  refetchUsers={refetchUsers}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="battle-pass">
            <BattlePassManager />
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
        </Tabs>

        <UserDetailsDialog
          userId={selectedUserId}
          isOpen={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      </div>
    </div>
  );
};

export default AdminPanel;
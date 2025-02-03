import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminPanel = () => {
  const navigate = useNavigate();

  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .single();
      return !!adminUser;
    },
  });

  useEffect(() => {
    if (isAdmin === false) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-colizeum-dark p-4 pt-24">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-white mb-8">Панель администратора</h1>
        {/* Add admin panel content here */}
      </div>
    </div>
  );
};

export default AdminPanel;
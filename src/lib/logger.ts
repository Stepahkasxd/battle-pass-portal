import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ActionType = Database["public"]["Enums"]["action_type"];

export const logAction = async (
  actionType: ActionType,
  description: string,
  metadata: Record<string, any> = {},
  userId?: string
) => {
  const { error } = await supabase.from("action_logs").insert({
    action_type: actionType,
    description,
    metadata,
    user_id: userId,
  });

  if (error) {
    console.error("Failed to log action:", error);
  }
};
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const userId = user?.id;

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("read", false)
      .neq("sender_id", userId);

    if (!error) {
      setUnreadCount(count || 0);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    fetchUnreadCount();

    const channel = supabase
      .channel(`unread-messages-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchUnreadCount]);

  return unreadCount;
}

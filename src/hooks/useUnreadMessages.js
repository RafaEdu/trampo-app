import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("read", false)
      .neq("sender_id", user.id);

    if (!error) {
      setUnreadCount(count || 0);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetchUnreadCount();

    const channel = supabase
      .channel("unread-messages-count")
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
  }, [user, fetchUnreadCount]);

  return unreadCount;
}

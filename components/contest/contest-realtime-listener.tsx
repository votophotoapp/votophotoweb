"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ContestRealtimeListenerProps {
  contestId: string;
}

export function ContestRealtimeListener({
  contestId,
}: ContestRealtimeListenerProps) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel(`contest-${contestId}`);

    // Listen for contest changes
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "contest",
        filter: `id=eq.${contestId}`,
      },
      () => {
        router.refresh();
      },
    );

    // Listen for contest category changes
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "contest_category",
        filter: `contest_id=eq.${contestId}`,
      },
      () => {
        router.refresh();
      },
    );

    // Listen for contest submission changes
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "contest_submission",
        filter: `contest_id=eq.${contestId}`,
      },
      () => {
        router.refresh();
      },
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contestId, router, supabase]);

  return null; // This component doesn't render anything
}

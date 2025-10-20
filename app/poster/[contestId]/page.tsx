import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getBaseUrl } from "@/lib/utils";
import { PosterContent } from "@/components/contest/poster-content";

interface PosterPageProps {
  params: Promise<{
    contestId: string;
  }>;
}

export default async function PosterPage({ params }: PosterPageProps) {
  const { contestId } = await params;
  const supabase = await createClient();

  const { data: contest, error } = await supabase
    .from("contest")
    .select("*")
    .eq("id", contestId)
    .single();

  if (error || !contest) {
    notFound();
  }

  const contestUrl = `${getBaseUrl()}/c/${contest.id}`;

  return <PosterContent contest={contest} contestUrl={contestUrl} />;
}

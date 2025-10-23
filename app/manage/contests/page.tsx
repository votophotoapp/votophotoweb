import { createClient } from "@/lib/supabase/server";
import CreateContestDialog from "./create-contest-dialog";
import { ContestWithStats } from "@/lib/database-types";
import ContestCard from "@/components/contest/contest-card";

export default async function Contests() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <div className="container mx-auto py-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12 w-full">
          <p className="text-muted-foreground">
            You must be logged in to view your contests.
          </p>
        </div>
      </div>
    );
  }

  const { data: contests } = await supabase
    .from("contest")
    .select()
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch submission counts for all contests
  const { data: submissions } = await supabase
    .from("contest_submission")
    .select("id, contest_id, image_url")
    .in("contest_id", contests?.map((c) => c.id) || []);

  // Fetch vote counts for all contests
  const { data: votes } = await supabase
    .from("contest_submission_vote")
    .select("contest_submission_id")
    .in("contest_submission_id", submissions?.map((s) => s.id) || []);

  // Create contest stats
  const contestsWithStats: ContestWithStats[] =
    contests?.map((contest) => {
      const contestSubmissions =
        submissions?.filter((s) => s.contest_id === contest.id) || [];
      const submissionCount = contestSubmissions.length;
      const voteCount =
        votes?.filter((v) => {
          const submission = contestSubmissions.find(
            (s) => s.id === v.contest_submission_id,
          );
          return submission !== undefined;
        }).length || 0;

      // Get first 4 photo URLs
      const photos = contestSubmissions.slice(0, 4).map((s) => s.image_url);

      return {
        ...contest,
        submissionCount,
        voteCount,
        photos,
      };
    }) || [];

  if (!contestsWithStats || contestsWithStats.length === 0) {
    return (
      <div className="container mx-auto py-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 w-full min-w-0">
          <h1 className="text-3xl font-bold flex-shrink-0">My Contests</h1>
          <div className="flex-shrink-0 ml-4">
            <CreateContestDialog />
          </div>
        </div>
        <div className="text-center py-12 w-full">
          <p className="text-muted-foreground">
            No contests available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between mb-8 w-full min-w-0">
        <h1 className="text-3xl font-bold flex-shrink-0">My Contests</h1>
        <div className="flex-shrink-0 ml-4">
          <CreateContestDialog />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {contestsWithStats.map((contest: ContestWithStats) => (
          <ContestCard key={contest.id} contest={contest} />
        ))}
      </div>
    </div>
  );
}

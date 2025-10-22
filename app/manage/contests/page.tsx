import { createClient } from "@/lib/supabase/server";
import CreateContestDialog from "./create-contest-dialog";
import { Contest } from "@/lib/database-types";
import ContestCard from "@/components/contest/contest-card";

export default async function Contests() {
  const supabase = await createClient();
  const { data: contests } = await supabase
    .from("contest")
    .select()
    .order("created_at", { ascending: false });

  if (!contests || contests.length === 0) {
    return (
      <div className="container mx-auto py-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 w-full min-w-0">
          <h1 className="text-3xl font-bold flex-shrink-0">Contests</h1>
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
      <div className="flex flex-col gap-6 w-full">
        {contests.map((contest: Contest) => (
          <ContestCard key={contest.id} contest={contest} />
        ))}
      </div>
    </div>
  );
}

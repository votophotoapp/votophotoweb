import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContestTitle } from "@/components/contest/contest-title";
import { ContestWelcomeMessage } from "@/components/contest/contest-welcome-message";
import { ContestCategories } from "@/components/contest/contest-categories";
import { ContestStats } from "@/components/contest/contest-stats";
import { DeleteContestDialog } from "@/components/contest/delete-contest-dialog";
import { ContestGuide } from "@/components/contest/contest-guide";
import { ReviewSubmissions } from "@/components/contest/review-submissions";
import { getBaseUrl } from "@/lib/utils";
import { ContestSubmission } from "@/lib/database-types";

interface ContestDetailPageProps {
  params: Promise<{
    contestId: string;
  }>;
}

export default async function ContestDetailPage({
  params,
}: ContestDetailPageProps) {
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

  // Fetch contest categories
  const { data: rawCategories } = await supabase
    .from("contest_category")
    .select("*")
    .eq("contest_id", contestId)
    .order("sort_order", { ascending: true });

  // Sort categories: if all sort_orders are 0, sort alphabetically
  const categories = rawCategories
    ? [...rawCategories].sort((a, b) => {
        // If both have the same sort_order (likely 0), sort alphabetically
        if (a.sort_order === b.sort_order) {
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }
        // Otherwise sort by sort_order
        return a.sort_order - b.sort_order;
      })
    : [];

  // Fetch contest submissions
  const { data: submissions } = await supabase
    .from("contest_submission")
    .select("*")
    .eq("contest_id", contestId)
    .order("created_at", { ascending: false });

  const contestUrl = `${getBaseUrl()}/c/${contest.id}`;

  return (
    <div className="container mx-auto py-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Contest Title Section */}
        <ContestTitle initialTitle={contest.title} contestId={contestId} />

        {/* Stats Cards */}
        <ContestStats
          submissionsCount={submissions?.length || 0}
          guestsVotedCount={0}
        />

        {/* Contest Guide */}
        <ContestGuide
          contest={contest}
          contestId={contestId}
          contestUrl={contestUrl}
          categories={categories}
          submissions={(submissions as ContestSubmission[]) || []}
        />

        {/* Contest Welcome Message Section */}
        <ContestWelcomeMessage
          initialWelcomeMessage={contest.welcome_message}
          contestId={contestId}
        />

        {/* Categories Section */}
        <ContestCategories
          contestId={contestId}
          initialCategories={categories || []}
        />

        {/* Review Submissions */}
        <Card id="review-submissions-card">
          <CardHeader>
            <CardTitle>Review Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewSubmissions
              contestId={contestId}
              submissions={(submissions as ContestSubmission[]) || []}
            />
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-destructive/20 rounded bg-destructive/5 space-y-3">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Delete Contest</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this contest and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <DeleteContestDialog
                contestId={contestId}
                contestTitle={contest.title}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

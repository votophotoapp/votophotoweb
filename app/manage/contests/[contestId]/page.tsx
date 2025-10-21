import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContestTitle } from "@/components/contest/contest-title";
import { ContestUrlSection } from "@/components/contest/contest-url-section";
import { ContestCategories } from "@/components/contest/contest-categories";
import { DeleteContestDialog } from "@/components/contest/delete-contest-dialog";
import { ReviewSubmissions } from "@/components/contest/review-submissions";
import { getBaseUrl } from "@/lib/utils";
import { SubmissionWithCategories } from "@/lib/database-types";

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
  const { data: rawSubmissions } = await supabase
    .from("contest_submission")
    .select(
      `
      *,
      category_submission (
        contest_category (
          id,
          name
        )
      )
    `
    )
    .eq("contest_id", contestId)
    .order("created_at", { ascending: false });

  // Transform the data to match our interface
  const submissions = (rawSubmissions as SubmissionWithCategories[]).map(
    (submission) => ({
      ...submission,
      categories:
        submission.category_submission
          ?.map((cs) => cs.contest_category)
          .filter(
            (cat): cat is { id: string; name: string } => cat !== undefined
          ) || [],
    })
  );

  const contestUrl = `${getBaseUrl()}/c/${contest.id}`;

  return (
    <div className="container mx-auto py-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Contest Title Section */}
        <ContestTitle initialTitle={contest.title} contestId={contestId} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl md:text-4xl font-bold">
                {submissions?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Photos submitted</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl md:text-4xl font-bold">
                {categories?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl md:text-4xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">Guests voted</p>
            </CardContent>
          </Card>
        </div>

        {/* Contest URL Section */}
        <ContestUrlSection contestUrl={contestUrl} contestId={contestId} />

        {/* Categories Section */}
        <ContestCategories
          contestId={contestId}
          initialCategories={categories || []}
        />

        {/* Count Votes Button */}
        <Card className="border-positive">
          <CardHeader>
            <CardTitle className="text-positive">Voting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-positive/20 rounded bg-positive/5 space-y-3">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Finish Contest</h4>
                <p className="text-sm text-muted-foreground">
                  Click the button below to count votes and reveal the winners.
                </p>
              </div>
              <Button variant="default" size="sm">
                Count Votes and Reveal Winners
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Review Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Review Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewSubmissions
              contestId={contestId}
              submissions={submissions || []}
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

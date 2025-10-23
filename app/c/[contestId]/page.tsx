import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { SubmissionDisplay } from "@/components/contest/submission-display";
import {
  ContestSubmission,
  Contest,
  ContestCategory,
} from "@/lib/database-types";
import { Metadata } from "next";
import { GuestSubmissionItem } from "@/components/contest/guest-submission-item";
import { YourVotes } from "@/components/contest/your-votes";

interface ContestPageProps {
  params: Promise<{
    contestId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ContestPageProps): Promise<Metadata> {
  const { contestId } = await params;
  const supabase = await createClient();

  const { data: contest } = await supabase
    .from("contest")
    .select("title")
    .eq("id", contestId)
    .single();

  return {
    title: contest?.title ? `${contest.title} - VotoPhoto` : "VotoPhoto",
  };
}

export default async function ContestPage({ params }: ContestPageProps) {
  const { contestId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contest")
    .select("*")
    .eq("id", contestId)
    .single();

  if (error || !data) {
    notFound();
  }

  const contest: Contest = data;

  // Fetch categories for the contest
  const { data: categoriesData } = await supabase
    .from("contest_category")
    .select("*")
    .eq("contest_id", contestId)
    .order("sort_order", { ascending: true });

  let categories: ContestCategory[] = [];
  if (categoriesData) {
    categories = categoriesData as ContestCategory[];
  }

  // Fetch all submissions for the contest
  const { data: submissionsData } = await supabase
    .from("contest_submission")
    .select("*")
    .eq("contest_id", contestId)
    .order("created_at", { ascending: false });

  let allSubmissions: ContestSubmission[] = [];
  if (submissionsData) {
    allSubmissions = submissionsData as ContestSubmission[];
  }

  // Fetch user's submissions if authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let userSubmissions: ContestSubmission[] = [];
  if (user) {
    const { data: submissions } = await supabase
      .from("contest_submission")
      .select("*")
      .eq("contest_id", contestId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (submissions) {
      userSubmissions = submissions as ContestSubmission[];
    }
  }

  // Fetch user's votes for all submissions if authenticated
  const userVotes: Record<string, Set<string>> = {};
  const votedCategories: Set<string> = new Set();
  if (user) {
    const { data: votesData } = await supabase
      .from("contest_submission_vote")
      .select("contest_submission_id, contest_category_id")
      .eq("user_id", user.id)
      .in(
        "contest_submission_id",
        allSubmissions.map((s) => s.id),
      );

    if (votesData) {
      votesData.forEach((vote) => {
        if (!userVotes[vote.contest_submission_id]) {
          userVotes[vote.contest_submission_id] = new Set();
        }
        userVotes[vote.contest_submission_id].add(vote.contest_category_id);
        votedCategories.add(vote.contest_category_id);
      });
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">{contest.title}</h1>
          {contest.welcome_message && (
            <p className="text-lg text-muted-foreground">
              {contest.welcome_message}
            </p>
          )}
        </div>

        {contest.submissions_opened_at === null && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            Submissions are not yet open. Check back soon to submit your photo.
          </div>
        )}

        {contest.submissions_closed_at !== null && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            Submissions are now closed. Check back soon to see who won!
          </div>
        )}

        {contest.submissions_opened_at !== null &&
          contest.submissions_closed_at === null && (
            <SubmissionDisplay
              contestId={contestId}
              userSubmissions={userSubmissions}
            />
          )}

        {user && contest.submissions_opened_at !== null && (
          <YourVotes
            categories={categories}
            userVotes={userVotes}
            votedCategories={votedCategories}
            allSubmissions={allSubmissions}
          />
        )}

        {contest.submissions_opened_at !== null && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Browse Submissions</h2>
              <p className="text-sm text-muted-foreground">
                Vote for your favorites in each category!
              </p>
            </div>
            {allSubmissions.length > 0 ? (
              <div className="space-y-4">
                {allSubmissions.map((submission) => (
                  <GuestSubmissionItem
                    key={submission.id}
                    submission={submission}
                    showTimestamp={true}
                    categories={categories}
                    user={user}
                    contestId={contestId}
                    userVotes={userVotes[submission.id] || new Set()}
                    votedCategories={votedCategories}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No submissions yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

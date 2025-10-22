import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { SubmissionDisplay } from "@/components/contest/submission-display";
import { ContestSubmission, Contest } from "@/lib/database-types";
import { Metadata } from "next";
import { GuestSubmissionItem } from "@/components/contest/guest-submission-item";

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{contest.title}</h1>
        {contest.welcome_message && (
          <p className="text-lg text-muted-foreground mb-8">
            {contest.welcome_message}
          </p>
        )}
        <SubmissionDisplay
          contestId={contestId}
          userSubmissions={userSubmissions}
        />
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Browse Submissions</h2>
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
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No submissions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

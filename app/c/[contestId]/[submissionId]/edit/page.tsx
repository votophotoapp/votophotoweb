import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SubmitPhotoForm } from "@/components/contest/submit-photo-form";
import { DeleteSubmission } from "@/components/contest/delete-submission";
import { Metadata } from "next";

interface EditSubmissionPageProps {
  params: Promise<{
    contestId: string;
    submissionId: string;
  }>;
}

export async function generateMetadata({
  params,
}: EditSubmissionPageProps): Promise<Metadata> {
  const { contestId } = await params;
  const supabase = await createClient();

  const { data: contest } = await supabase
    .from("contest")
    .select("title")
    .eq("id", contestId)
    .single();

  return {
    title: contest?.title
      ? `Edit Submission - ${contest.title} - VotoPhoto`
      : "Edit Submission - VotoPhoto",
  };
}

export default async function EditSubmissionPage({
  params,
}: EditSubmissionPageProps) {
  const { contestId, submissionId } = await params;
  const supabase = await createClient();

  // Verify contest exists
  const { data: contest, error: contestError } = await supabase
    .from("contest")
    .select("id")
    .eq("id", contestId)
    .single();

  if (contestError || !contest) {
    notFound();
  }

  // Fetch submission and verify ownership or contest management permissions
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Check if user is the contest owner (manager)
  const { data: contestOwnerCheck } = await supabase
    .from("contest")
    .select("user_id")
    .eq("id", contestId)
    .eq("user_id", user.id)
    .single();

  const isContestOwner = !!contestOwnerCheck;

  // Fetch submission - owners can edit any submission, regular users can only edit their own
  let submissionQuery = supabase
    .from("contest_submission")
    .select("*")
    .eq("id", submissionId)
    .eq("contest_id", contestId);

  if (!isContestOwner) {
    submissionQuery = submissionQuery.eq("user_id", user.id);
  }

  const { data: submission, error: submissionError } =
    await submissionQuery.single();

  if (submissionError || !submission) {
    notFound();
  }

  const existingSubmission = {
    id: submission.id,
    title: submission.title,
    description: submission.description,
    image_url: submission.image_url,
    display_name: submission.display_name,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href={
              isContestOwner
                ? `/manage/contests/${contestId}`
                : `/c/${contestId}`
            }
          >
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {isContestOwner ? "Back to Manage Contest" : "Back to Contest"}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Edit Submission</h1>
          <p className="text-muted-foreground mt-2">
            Update the details of this photo submission
          </p>
        </div>

        <SubmitPhotoForm
          contestId={contestId}
          existingSubmission={existingSubmission}
        />
        <DeleteSubmission
          contestId={contestId}
          submissionId={submissionId}
          redirectTo={
            isContestOwner ? `/manage/contests/${contestId}` : `/c/${contestId}`
          }
        />
      </div>
    </div>
  );
}

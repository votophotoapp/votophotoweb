import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SubmitPhotoForm } from "@/components/contest/submit-photo-form";
import { DeleteSubmission } from "@/components/contest/delete-submission";

interface EditSubmissionPageProps {
  params: Promise<{
    contestId: string;
    submissionId: string;
  }>;
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

  // Fetch categories
  const { data: categories } = await supabase
    .from("contest_category")
    .select("id, name, sort_order")
    .eq("contest_id", contestId)
    .order("sort_order", { ascending: true });

  // Fetch selected categories for this submission
  const { data: selectedCategories } = await supabase
    .from("category_submission")
    .select("contest_category_id")
    .eq("contest_submission_id", submissionId);

  const categoryIds =
    selectedCategories?.map((sc) => sc.contest_category_id) || [];

  const existingSubmission = {
    id: submission.id,
    title: submission.title,
    description: submission.description,
    image_url: submission.image_url,
    categories: categoryIds,
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
          categories={categories || []}
          existingSubmission={existingSubmission}
        />

        <DeleteSubmission contestId={contestId} submissionId={submissionId} />
      </div>
    </div>
  );
}

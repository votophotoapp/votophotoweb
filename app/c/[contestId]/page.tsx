import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { SubmissionDisplay } from "@/components/contest/submission-display";
import { SubmissionWithCategories } from "@/lib/database-types";

interface ContestPageProps {
  params: Promise<{
    contestId: string;
  }>;
}

export default async function ContestPage({ params }: ContestPageProps) {
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

  // Fetch categories
  const { data: categories } = await supabase
    .from("contest_category")
    .select("*")
    .eq("contest_id", contestId)
    .order("sort_order", { ascending: true });

  // Fetch user's submissions if authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let userSubmissions: SubmissionWithCategories[] = [];
  if (user) {
    const { data: submissions } = await supabase
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
      `,
      )
      .eq("contest_id", contestId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (submissions) {
      // Transform the data to match our interface
      userSubmissions = (submissions as SubmissionWithCategories[]).map(
        (submission) => ({
          ...submission,
          categories:
            submission.category_submission
              ?.map((cs) => cs.contest_category)
              .filter(
                (cat): cat is { id: string; name: string } => cat !== undefined,
              ) || [],
        }),
      );
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{contest.title}</h1>
        {contest.description && (
          <p className="text-lg text-muted-foreground mb-8">
            {contest.description}
          </p>
        )}
        <SubmissionDisplay
          contestId={contestId}
          userSubmissions={userSubmissions}
        />
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Categories</h2>
          {categories && categories.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {categories.map((category) => (
                <div key={category.id} className="p-4 border rounded-lg">
                  <h3 className="text-xl font-medium">{category.name}</h3>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No categories available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

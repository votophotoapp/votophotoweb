import { createClient } from "@/lib/supabase/server";
import { ContestSubmission, ContestCategory } from "@/lib/database-types";

export interface Winner {
  submission: ContestSubmission;
  voteCount: number;
  categoryName: string;
  place: number;
}

export async function getWinners(
  contestId: string,
  categories: ContestCategory[],
): Promise<Winner[]> {
  const supabase = await createClient();

  // Get all votes for this contest
  const { data: votes } = await supabase
    .from("contest_submission_vote")
    .select(
      `
      contest_category_id,
      contest_submission_id,
      contest_submission!inner (
        id,
        title,
        display_name,
        image_url,
        description,
        contest_id
      )
    `,
    )
    .eq("contest_submission.contest_id", contestId);

  if (!votes) {
    return [];
  }

  // Group votes by category and submission
  const voteCounts: Record<
    string,
    Record<string, { submission: ContestSubmission; count: number }>
  > = {};

  votes.forEach((vote) => {
    const categoryId = vote.contest_category_id;
    const submissionId = vote.contest_submission_id;
    const submission = vote.contest_submission as unknown as ContestSubmission;

    if (!voteCounts[categoryId]) {
      voteCounts[categoryId] = {};
    }

    if (!voteCounts[categoryId][submissionId]) {
      voteCounts[categoryId][submissionId] = {
        submission,
        count: 0,
      };
    }

    voteCounts[categoryId][submissionId].count++;
  });

  // Find winners for each category (highest vote count, or tie-break by submission ID)
  const winners: Winner[] = [];

  categories?.forEach((category) => {
    const categoryVotes = voteCounts[category.id];
    if (!categoryVotes) return;

    const submissions = Object.values(categoryVotes);
    if (submissions.length === 0) return;

    // Sort by vote count descending, then by submission ID
    submissions.sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count;
      }
      return a.submission.id.localeCompare(b.submission.id);
    });

    // Assign places, handling ties (same place for same count)
    let currentPlace = 0;
    let currentCount = -1;
    for (const sub of submissions) {
      if (sub.count !== currentCount) {
        currentPlace++;
        currentCount = sub.count;
      }
      if (currentPlace > 3) break;
      winners.push({
        submission: sub.submission,
        voteCount: sub.count,
        categoryName: category.name,
        place: currentPlace,
      });
    }
  });

  return winners;
}

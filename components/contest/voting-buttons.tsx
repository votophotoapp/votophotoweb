"use client";

import { ContestCategory } from "@/lib/database-types";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { useState } from "react";
import { submitVote, removeVote } from "@/app/c/[contestId]/actions";

interface VotingButtonsProps {
  submissionId: string;
  categories: ContestCategory[];
  user: User | null;
  contestId: string;
  userVotes: Set<string>;
  votedCategories: Set<string>;
}

export function VotingButtons({
  submissionId,
  categories,
  user,
  contestId,
  userVotes,
  votedCategories,
}: VotingButtonsProps) {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (categoryId: string) => {
    if (!user || isVoting) return;

    // Don't allow voting for categories already used in other submissions
    if (votedCategories.has(categoryId) && !userVotes.has(categoryId)) {
      return;
    }

    const hasVoted = userVotes.has(categoryId);
    setIsVoting(true);

    try {
      let result;
      if (hasVoted) {
        result = await removeVote(submissionId, categoryId, contestId);
      } else {
        result = await submitVote(submissionId, categoryId, contestId);
      }

      if (result.success) {
        // The page will be revalidated by the server action, so the UI will update
        // We don't need to update local state since the page will refresh
      } else {
        console.error("Vote operation failed:", result.error);
      }
    } catch (error) {
      console.error("Error toggling vote:", error);
    } finally {
      setIsVoting(false);
    }
  };

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        Sign in to vote for submissions.
      </p>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Vote for this submission:</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const hasVoted = userVotes.has(category.id);
          const categoryUsedElsewhere =
            votedCategories.has(category.id) && !hasVoted;
          const isDisabled = isVoting || categoryUsedElsewhere;

          return (
            <Button
              key={category.id}
              variant={hasVoted ? "default" : "outline"}
              size="sm"
              onClick={() => handleVote(category.id)}
              disabled={isDisabled}
              title={
                categoryUsedElsewhere
                  ? "You have already voted for this category in another submission"
                  : undefined
              }
            >
              {hasVoted ? `✓ ${category.name}` : category.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

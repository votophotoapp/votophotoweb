"use client";

import { ContestCategory, ContestSubmission } from "@/lib/database-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface YourVotesProps {
  categories: ContestCategory[];
  userVotes: Record<string, Set<string>>;
  votedCategories: Set<string>;
  allSubmissions: ContestSubmission[];
}

export function YourVotes({
  categories,
  userVotes,
  votedCategories,
  allSubmissions,
}: YourVotesProps) {
  // Create a map of category ID to submission that was voted for
  const votedSubmissions: Record<string, ContestSubmission> = {};

  // Find the submission for each voted category
  Object.entries(userVotes).forEach(([submissionId, categoryIds]) => {
    const submission = allSubmissions.find((s) => s.id === submissionId);
    if (submission) {
      categoryIds.forEach((categoryId) => {
        votedSubmissions[categoryId] = submission;
      });
    }
  });

  const hasVotes = votedCategories.size > 0;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold">Your Votes</h2>
        <p className="text-sm text-muted-foreground">
          {hasVotes
            ? "Here's what you've voted for in each category."
            : "Vote for your favorite submissions in each category below."}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {categories.map((category) => {
          const hasVotedForCategory = votedCategories.has(category.id);
          const votedSubmission = votedSubmissions[category.id];

          return (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="p-3">
                <CardTitle className="text-sm">{category.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {hasVotedForCategory && votedSubmission ? (
                  <div className="space-y-2">
                    <div className="relative w-full aspect-square rounded-md overflow-hidden">
                      <Image
                        src={votedSubmission.image_url}
                        alt={votedSubmission.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-xs line-clamp-2">
                        {votedSubmission.title}
                      </h4>
                      {votedSubmission.display_name && (
                        <p className="text-xs text-muted-foreground">
                          by {votedSubmission.display_name}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-20 border-2 border-dashed border-muted-foreground/25 rounded-md">
                    <p className="text-xs text-muted-foreground text-center">
                      No vote
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

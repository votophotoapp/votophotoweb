import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserSubmissionItem } from "./user-submission-item";
import { ContestSubmission } from "@/lib/database-types";

interface SubmissionDisplayProps {
  contestId: string;
  userSubmissions: ContestSubmission[];
  submissionsClosed: boolean;
}

export function SubmissionDisplay({
  contestId,
  userSubmissions,
  submissionsClosed,
}: SubmissionDisplayProps) {
  return (
    <div>
      {userSubmissions.length > 0 ? (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Your Submissions</h2>
            <p className="text-sm text-muted-foreground">
              Here are the photos you&apos;ve submitted to this contest.
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            {userSubmissions.map((submission) => (
              <UserSubmissionItem
                key={submission.id}
                submission={submission}
                contestId={contestId}
                showTimestamp={false}
                useCard={false}
                titleSize="xl"
              />
            ))}
            {!submissionsClosed && (
              <Link href={`/c/${contestId}/submit`}>
                <Button>Add Another Photo</Button>
              </Link>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Your Submissions</h2>
            <p className="text-sm text-muted-foreground">
              You haven&apos;t submitted any photos yet. Ready to upload your
              first photo?
            </p>
          </div>
          <div>
            {!submissionsClosed && (
              <Link href={`/c/${contestId}/submit`}>
                <Button>Add Your Photo</Button>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

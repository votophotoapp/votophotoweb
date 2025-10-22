import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserSubmissionItem } from "./user-submission-item";
import { ContestSubmission } from "@/lib/database-types";

interface SubmissionDisplayProps {
  contestId: string;
  userSubmissions: ContestSubmission[];
}

export function SubmissionDisplay({
  contestId,
  userSubmissions,
}: SubmissionDisplayProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-6 mb-8">
      {userSubmissions.length > 0 ? (
        <>
          <h2 className="text-2xl font-semibold mb-4">
            Your Submission{userSubmissions.length > 1 ? "s" : ""}
          </h2>
          <div className="space-y-6">
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
          </div>
          <div className="mt-6 pt-6 border-t">
            <p className="text-muted-foreground mb-4">
              Want to submit another photo?
            </p>
            <Link href={`/c/${contestId}/submit`}>
              <Button>Add Another Photo</Button>
            </Link>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-2">Welcome!</h2>
          <p className="text-muted-foreground mb-4">
            Ready to upload your photo for the contest?
          </p>
          <div>
            <Link href={`/c/${contestId}/submit`}>
              <Button>Add Your Photo</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

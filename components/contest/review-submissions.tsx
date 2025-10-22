import { ContestSubmission } from "@/lib/database-types";
import { UserSubmissionItem } from "./user-submission-item";

interface ReviewSubmissionsProps {
  contestId: string;
  submissions: ContestSubmission[];
}

export function ReviewSubmissions({
  contestId,
  submissions,
}: ReviewSubmissionsProps) {
  if (submissions.length === 0) {
    return (
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No submissions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <UserSubmissionItem
          key={submission.id}
          submission={submission}
          contestId={contestId}
          showTimestamp={true}
          useCard={true}
          titleSize="lg"
        />
      ))}
    </div>
  );
}

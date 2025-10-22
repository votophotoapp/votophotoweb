import { formatUtcToLocal } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContestSubmission } from "@/lib/database-types";

interface UserSubmissionItemProps {
  submission: ContestSubmission;
  contestId: string;
  showTimestamp?: boolean;
  useCard?: boolean;
  titleSize?: "lg" | "xl";
  showEditButton?: boolean;
}

export function UserSubmissionItem({
  submission,
  contestId,
  showTimestamp = false,
  useCard = false,
  titleSize = "xl",
  showEditButton = true,
}: UserSubmissionItemProps) {
  const titleClass = titleSize === "lg" ? "text-lg" : "text-xl font-medium";

  const content = (
    <div className="flex min-h-32">
      <div className="relative w-32 sm:w-48 flex-shrink-0">
        <Image
          src={submission.image_url}
          alt={submission.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 p-4">
        {useCard ? (
          <>
            <CardHeader className="p-0 pb-2">
              <CardTitle className={titleClass}>{submission.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {submission.description && (
                <p className="mb-3 italic">
                  &quot;{submission.description}&quot;
                </p>
              )}
              {showTimestamp && (
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span>
                    Submitted on {formatUtcToLocal(submission.created_at)} by{" "}
                    <strong>{submission.display_name || "Anonymous"}</strong>
                  </span>
                </div>
              )}
              {showEditButton && (
                <div className="mt-3">
                  <Link href={`/c/${contestId}/${submission.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit Submission
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <>
            <h3 className={`${titleClass} mb-2`}>{submission.title}</h3>
            {submission.description && (
              <p className="text-muted-foreground mb-3">
                {submission.description}
              </p>
            )}
            {showEditButton && (
              <div className="pt-2">
                <Link href={`/c/${contestId}/${submission.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit Submission
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (useCard) {
    return (
      <Card key={submission.id} className="overflow-hidden">
        {content}
      </Card>
    );
  }

  return (
    <div
      key={submission.id}
      className="bg-background rounded-lg border overflow-hidden"
    >
      {content}
    </div>
  );
}

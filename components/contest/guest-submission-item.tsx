import { formatUtcToLocal } from "@/lib/utils";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContestSubmission } from "@/lib/database-types";

interface GuestSubmissionItemProps {
  submission: ContestSubmission;
  showTimestamp?: boolean;
}

export function GuestSubmissionItem({
  submission,
  showTimestamp = true,
}: GuestSubmissionItemProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative w-full aspect-square">
        <Image
          src={submission.image_url}
          alt={submission.title}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{submission.title}</CardTitle>
        {showTimestamp && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {submission.display_name !== undefined && (
                <span>{submission.display_name || "Anonymous"}</span>
              )}
            </span>
            <span>
              {formatUtcToLocal(submission.created_at, "MMM D, h:mm A")}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {submission.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {submission.description}
          </p>
        )}
        {/* Future: Add voting buttons here */}
      </CardContent>
    </Card>
  );
}

import { formatUtcToLocal } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubmissionWithCategories } from "@/lib/database-types";

interface SubmissionItemProps {
  submission: SubmissionWithCategories;
  contestId: string;
  showTimestamp?: boolean;
  useCard?: boolean;
  titleSize?: "lg" | "xl";
  showNoCategoriesBadge?: boolean;
  showCategories?: boolean;
  showEditButton?: boolean;
}

export function SubmissionItem({
  submission,
  contestId,
  showTimestamp = false,
  useCard = false,
  titleSize = "xl",
  showNoCategoriesBadge = false,
  showCategories = true,
  showEditButton = true,
}: SubmissionItemProps) {
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
              {showTimestamp && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    Submitted {formatUtcToLocal(submission.created_at)}
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {submission.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {submission.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {showCategories &&
                submission.categories &&
                submission.categories.length > 0 ? (
                  submission.categories.map((category) => (
                    <Badge key={category.id} variant="secondary">
                      {category.name}
                    </Badge>
                  ))
                ) : showNoCategoriesBadge ? (
                  <Badge variant="outline">No categories</Badge>
                ) : null}
              </div>
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
            {showCategories &&
              submission.categories &&
              submission.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {submission.categories.map((category) => (
                    <Badge key={category.id} variant="secondary">
                      {category.name}
                    </Badge>
                  ))}
                </div>
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

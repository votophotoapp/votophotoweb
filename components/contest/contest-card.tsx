import { formatUtcToLocal } from "@/lib/utils";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { ContestWithStats } from "@/lib/database-types";

interface ContestCardProps {
  contest: ContestWithStats;
}

function getContestStatus(contest: ContestWithStats): string {
  if (contest.winners_revealed_at) {
    return "Winners Revealed";
  }
  if (contest.submissions_closed_at) {
    return "Submissions Closed";
  }
  if (contest.submissions_opened_at) {
    return "Submissions Open";
  }
  return "Not Started";
}

export default function ContestCard({ contest }: ContestCardProps) {
  const status = getContestStatus(contest);

  // Create array of 4 items: photos or placeholders
  const photoItems = Array.from({ length: 4 }, (_, index) => {
    if (index < contest.photos.length) {
      return { type: "photo", url: contest.photos[index] };
    }
    return { type: "placeholder", color: `hsl(${index * 90}, 70%, 85%)` };
  });

  return (
    <Card key={contest.id} className="flex flex-col w-full relative">
      {/* Status Badge - positioned absolutely over photo grid */}
      <div className="absolute top-2 right-2 z-10">
        <Badge variant="secondary">{status}</Badge>
      </div>

      {/* Photo Grid */}
      <div className="w-full aspect-square mb-4">
        <div className="grid grid-cols-2 gap-1 h-full w-full rounded-md overflow-hidden">
          {photoItems.map((item, index) => (
            <div
              key={index}
              className="aspect-square rounded-sm overflow-hidden bg-gray-200"
              style={
                item.type === "placeholder"
                  ? { backgroundColor: item.color }
                  : {}
              }
            >
              {item.type === "photo" && item.url && (
                <Image
                  src={item.url}
                  alt={`Contest photo ${index + 1}`}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contest Details */}
      <div className="flex flex-col flex-1 p-4">
        <CardTitle className="text-lg line-clamp-2 mb-2">
          {contest.title}
        </CardTitle>

        <CardDescription className="text-sm text-muted-foreground mb-3">
          Created {formatUtcToLocal(contest.created_at)}
        </CardDescription>

        <div className="flex flex-col gap-1 mb-4">
          <div className="text-sm font-medium">
            {contest.submissionCount}{" "}
            {contest.submissionCount === 1 ? "photo" : "photos"} submitted
          </div>
          <div className="text-sm font-medium">
            {contest.voteCount} {contest.voteCount === 1 ? "vote" : "votes"}{" "}
            received
          </div>
        </div>

        <div className="mt-auto">
          <Button asChild className="w-full">
            <Link href={`/manage/contests/${contest.id}`}>View Contest</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

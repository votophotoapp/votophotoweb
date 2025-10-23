import { formatUtcToLocal } from "@/lib/utils";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Contest } from "@/lib/database-types";

interface ContestCardProps {
  contest: Contest;
}

export default function ContestCard({ contest }: ContestCardProps) {
  return (
    <Card key={contest.id} className="flex flex-row items-start w-full">
      {/* Contest Details */}
      <div className="flex flex-col flex-1">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="line-clamp-2">{contest.title}</CardTitle>
            {!contest.submissions_opened_at && (
              <Badge variant="secondary">Not Started</Badge>
            )}
          </div>
          <CardDescription>
            Created on {formatUtcToLocal(contest.created_at)}
            {contest.submissions_opened_at && (
              <div>
                Started on {formatUtcToLocal(contest.submissions_opened_at)}
              </div>
            )}
            {contest.submissions_closed_at && (
              <div>
                Ended on {formatUtcToLocal(contest.submissions_closed_at)}
              </div>
            )}
            {contest.winners_revealed_at && (
              <div>
                Votes counted on {formatUtcToLocal(contest.winners_revealed_at)}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-0 mt-auto">
          <Button asChild>
            <Link href={`/manage/contests/${contest.id}`}>View</Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}

import { Card, CardContent } from "@/components/ui/card";

interface ContestStatsProps {
  submissionsCount: number;
  votesReceivedCount?: number;
  guestsSubmittedCount?: number;
  guestsVotedCount?: number;
}

export function ContestStats({
  submissionsCount,
  votesReceivedCount = 0,
  guestsSubmittedCount = 0,
  guestsVotedCount = 0,
}: ContestStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="text-3xl md:text-4xl font-bold">
            {submissionsCount}
          </div>
          <p className="text-sm text-muted-foreground">
            Photos submitted by {guestsSubmittedCount} guest
            {guestsSubmittedCount !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="text-3xl md:text-4xl font-bold">
            {votesReceivedCount}
          </div>
          <p className="text-sm text-muted-foreground">
            Votes received from {guestsVotedCount} guest
            {guestsVotedCount !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

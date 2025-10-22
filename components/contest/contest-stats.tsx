import { Card, CardContent } from "@/components/ui/card";

interface ContestStatsProps {
  submissionsCount: number;
  guestsVotedCount?: number;
}

export function ContestStats({
  submissionsCount,
  guestsVotedCount = 0,
}: ContestStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="text-3xl md:text-4xl font-bold">
            {submissionsCount}
          </div>
          <p className="text-sm text-muted-foreground">Photos submitted</p>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="text-3xl md:text-4xl font-bold">
            {guestsVotedCount}
          </div>
          <p className="text-sm text-muted-foreground">Guests voted</p>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Winner } from "@/components/contest/winners-utils";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trophy, PartyPopper } from "lucide-react";

interface WinnersProps {
  winners: Winner[];
}

export function Winners({ winners }: WinnersProps) {
  if (winners.length === 0) {
    return (
      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <PartyPopper className="w-5 h-5 text-yellow-500" />
            Winners
          </h2>
          <p className="text-sm text-muted-foreground">No winners yet.</p>
        </div>
      </div>
    );
  }

  // Group winners by category
  const winnersByCategory = winners.reduce(
    (acc, winner) => {
      if (!acc[winner.categoryName]) {
        acc[winner.categoryName] = [];
      }
      acc[winner.categoryName].push(winner);
      return acc;
    },
    {} as Record<string, Winner[]>
  );

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Winners
        </h2>
        <p className="text-sm text-muted-foreground">
          Congratulations to the winners in each category!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(winnersByCategory).map(
          ([categoryName, categoryWinners]) => (
            <Card key={categoryName} className="overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{categoryName}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                {categoryWinners.map((winner) => (
                  <div key={winner.submission.id} className="flex space-x-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="flex-shrink-0 cursor-pointer">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden">
                            <Image
                              src={winner.submission.image_url}
                              alt={winner.submission.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-[90vw] max-h-[90vh] p-4">
                        <DialogTitle className="text-lg font-semibold">
                          {winner.submission.title}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mb-4">
                          {winner.submission.display_name &&
                            `by ${winner.submission.display_name}`}
                        </DialogDescription>
                        <div className="text-center mb-2">
                          <p className="text-lg font-semibold text-primary flex items-center justify-center">
                            <Trophy className="w-5 h-5 mr-2" />
                            {getPlaceText(winner.place)}
                          </p>
                          <p className="text-md text-muted-foreground">
                            {winner.voteCount} vote
                            {winner.voteCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="relative w-full h-full min-h-[50vh]">
                          <Image
                            src={winner.submission.image_url}
                            alt={winner.submission.title}
                            fill
                            className="object-contain"
                          />
                        </div>
                        {winner.submission.description && (
                          <p className="text-sm text-muted-foreground mt-2 text-center">
                            {winner.submission.description}
                          </p>
                        )}
                      </DialogContent>
                    </Dialog>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {winner.submission.title}
                      </h4>
                      {winner.submission.display_name && (
                        <p className="text-xs text-muted-foreground">
                          by {winner.submission.display_name}
                        </p>
                      )}
                      <p className="text-xs font-medium text-primary mt-1">
                        {getPlaceText(winner.place)} • {winner.voteCount} vote
                        {winner.voteCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}

function getPlaceText(place: number): string {
  switch (place) {
    case 1:
      return "1st Place";
    case 2:
      return "2nd Place";
    case 3:
      return "3rd Place";
    default:
      return `${place}th Place`;
  }
}

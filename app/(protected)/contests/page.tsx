import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreateContestDialog from "./create-contest-dialog";
import Link from "next/link";

interface Contest {
  id: string;
  title: string;
  created_at: string;
}

export default async function Contests() {
  const supabase = await createClient();
  const { data: contests } = await supabase.from("contest").select();

  if (!contests || contests.length === 0) {
    return (
      <div className="container mx-auto py-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 w-full min-w-0">
          <h1 className="text-3xl font-bold flex-shrink-0">Contests</h1>
          <div className="flex-shrink-0 ml-4">
            <CreateContestDialog />
          </div>
        </div>
        <div className="text-center py-12 w-full">
          <p className="text-muted-foreground">
            No contests available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8 w-full min-w-0">
        <h1 className="text-3xl font-bold flex-shrink-0">Contests</h1>
        <div className="flex-shrink-0 ml-4">
          <CreateContestDialog />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
        {contests.map((contest: Contest) => (
          <Card key={contest.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="line-clamp-2">{contest.title}</CardTitle>
              <CardDescription>
                Created: {new Date(contest.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/contests/${contest.id}`}>View Contest</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContestTitle } from "@/components/contest/contest-title";
import { ContestUrlSection } from "@/components/contest/contest-url-section";
import { getBaseUrl } from "@/lib/utils";

interface ContestDetailPageProps {
  params: Promise<{
    contestId: string;
  }>;
}

export default async function ContestDetailPage({
  params,
}: ContestDetailPageProps) {
  const { contestId } = await params;
  const supabase = await createClient();

  const { data: contest, error } = await supabase
    .from("contest")
    .select("*")
    .eq("id", contestId)
    .single();

  if (error || !contest) {
    notFound();
  }

  const contestUrl = `${getBaseUrl()}/c/${contest.id}`;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Contest Title Section */}
        <ContestTitle initialTitle={contest.title} contestId={contestId} />

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">Photos submitted</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">1</div>
              <p className="text-sm text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">Guests voted</p>
            </CardContent>
          </Card>
        </div>

        {/* Contest URL Section */}
        <ContestUrlSection contestUrl={contestUrl} contestId={contestId} />

        {/* Count Votes Button */}
        <div className="text-center">
          <Button size="lg" className="px-8 py-4 text-lg">
            Count Votes and Reveal Winner!
          </Button>
        </div>

        {/* Categories Section */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <span>Best Costume</span>
              <Button variant="outline" size="sm">
                Remove
              </Button>
            </div>
            <Button variant="link" className="p-0 h-auto text-blue-600">
              Add Category
            </Button>
          </CardContent>
        </Card>

        {/* Review Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Review Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No submissions yet</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

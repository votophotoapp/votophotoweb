import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SubmitPhotoForm } from "@/components/contest/submit-photo-form";
import { Metadata } from "next";

interface SubmitPhotoPageProps {
  params: Promise<{
    contestId: string;
  }>;
}

export async function generateMetadata({
  params,
}: SubmitPhotoPageProps): Promise<Metadata> {
  const { contestId } = await params;
  const supabase = await createClient();

  const { data: contest } = await supabase
    .from("contest")
    .select("title")
    .eq("id", contestId)
    .single();

  return {
    title: contest?.title
      ? `Submit to ${contest.title} - VotoPhoto`
      : "Submit Photo - VotoPhoto",
  };
}

export default async function SubmitPhotoPage({
  params,
}: SubmitPhotoPageProps) {
  const { contestId } = await params;
  const supabase = await createClient();

  // Verify contest exists
  const { data: contest, error: contestError } = await supabase
    .from("contest")
    .select("id")
    .eq("id", contestId)
    .single();

  if (contestError || !contest) {
    notFound();
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from("contest_category")
    .select("id, name, sort_order")
    .eq("contest_id", contestId)
    .order("sort_order", { ascending: true });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href={`/c/${contestId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contest
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Submit Your Photo</h1>
          <p className="text-muted-foreground mt-2">
            Share your photography skills with the world
          </p>
        </div>

        <SubmitPhotoForm contestId={contestId} categories={categories || []} />
      </div>
    </div>
  );
}

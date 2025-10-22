"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteSubmissionProps {
  contestId: string;
  submissionId: string;
  redirectTo?: string;
}

export function DeleteSubmission({
  contestId,
  submissionId,
  redirectTo,
}: DeleteSubmissionProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you absolutely sure you want to delete this submission? This action cannot be undone.",
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      // Delete the submission (cascade will handle category relationships)
      const { error } = await supabase
        .from("contest_submission")
        .delete()
        .eq("id", submissionId);

      if (error) {
        throw error;
      }

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        // Redirect back to contest page
        router.push(`/c/${contestId}`);
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert("Failed to delete submission. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-8 border border-destructive/50 rounded-lg p-6 bg-destructive/5">
      <h3 className="text-lg font-semibold text-destructive mb-2">
        Danger Zone
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Once you delete this submission, there is no going back. This action
        cannot be undone.
      </p>

      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {isDeleting ? "Deleting..." : "Delete Submission"}
      </Button>
    </div>
  );
}

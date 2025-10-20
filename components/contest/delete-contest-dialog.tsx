"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteContest } from "@/app/manage/contests/actions";

interface DeleteContestDialogProps {
  contestId: string;
  contestTitle: string;
}

export function DeleteContestDialog({
  contestId,
  contestTitle,
}: DeleteContestDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteContest(contestId);
      setOpen(false);
      // Redirect to contests list after successful deletion
      router.push("/manage/contests");
    } catch (error) {
      console.error("Failed to delete contest:", error);
      // TODO: Add proper error handling/toast notification
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete Contest
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Contest</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{contestTitle}&rdquo;? This
            action cannot be undone and will permanently remove the contest, all
            submissions, and voting data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Contest"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

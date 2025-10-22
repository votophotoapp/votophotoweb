"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateContestTitle } from "@/app/manage/contests/actions";

interface ContestTitleProps {
  initialTitle: string;
  contestId: string;
}

export function ContestTitle({ initialTitle, contestId }: ContestTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [tempTitle, setTempTitle] = useState(initialTitle);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    setTempTitle(title);
    setIsEditing(true);
    setError(null);
  };

  const handleSave = async () => {
    if (tempTitle.trim() === title.trim()) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateContestTitle(contestId, tempTitle.trim());
      if (result.success) {
        setTitle(tempTitle.trim());
        setIsEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update title");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTempTitle(title);
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 w-full">
          <Input
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-base h-auto py-2 flex-1"
            autoFocus
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold">{title}</h1>
      <Button
        variant="link"
        className="p-0 h-auto text-blue-600"
        onClick={handleEdit}
      >
        Edit
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateContestWelcomeMessage } from "@/app/manage/contests/actions";

interface ContestWelcomeMessageProps {
  initialWelcomeMessage: string | null;
  contestId: string;
}

export function ContestWelcomeMessage({
  initialWelcomeMessage,
  contestId,
}: ContestWelcomeMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState(
    initialWelcomeMessage || "",
  );
  const [tempWelcomeMessage, setTempWelcomeMessage] = useState(
    initialWelcomeMessage || "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    setTempWelcomeMessage(welcomeMessage);
    setIsEditing(true);
    setError(null);
  };

  const handleSave = async () => {
    if (tempWelcomeMessage.trim() === welcomeMessage.trim()) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateContestWelcomeMessage(
        contestId,
        tempWelcomeMessage.trim(),
      );
      if (result.success) {
        setWelcomeMessage(tempWelcomeMessage.trim());
        setIsEditing(false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update welcome message",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTempWelcomeMessage(welcomeMessage);
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <Card id="welcome-message-card">
        <CardHeader>
          <CardTitle>Welcome Message (optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Textarea
              value={tempWelcomeMessage}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setTempWelcomeMessage(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Welcome to the costume contest! Please upload a photo of your costume and then vote on your favorites."
              className="min-h-[100px] resize-none"
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="welcome-message-card">
      <CardHeader>
        <CardTitle>Welcome Message (optional)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-muted-foreground">
          {welcomeMessage ? (
            <p className="whitespace-pre-wrap">{welcomeMessage}</p>
          ) : (
            <p className="italic">No welcome message set</p>
          )}
        </div>
        <Button
          variant="link"
          className="p-0 h-auto text-blue-600"
          onClick={handleEdit}
        >
          {welcomeMessage ? "Edit" : "Add"} Welcome Message
        </Button>
      </CardContent>
    </Card>
  );
}

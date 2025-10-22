"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Contest, Category, ContestSubmission } from "@/lib/database-types";
import {
  startContest,
  endContest,
  unstartContest,
  countVotes,
  uncountVotes,
  unendContest,
} from "@/app/manage/contests/actions";
import { formatUtcToLocal } from "@/lib/utils";
import {
  CheckCircle,
  Play,
  Circle,
  Copy,
  QrCode,
  X,
  Download,
  Check,
  FileText,
} from "lucide-react";
import QRCode from "qrcode";

interface ContestStatusProps {
  contest: Contest;
  contestId: string;
  contestUrl: string;
  categories?: Category[];
  submissions?: ContestSubmission[];
}

export function ContestStatus({
  contest,
  contestId,
  categories = [],
  contestUrl,
  submissions = [],
}: ContestStatusProps) {
  const [copied, setCopied] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const titleComplete = !!contest.title;
  const welcomeComplete = !!contest.welcome_message;
  const categoriesComplete = categories.length > 0;
  const allComplete = titleComplete && welcomeComplete && categoriesComplete;
  const completedItems = [
    titleComplete && "Title Added",
    welcomeComplete && "Welcome Message Added",
    categoriesComplete && `${categories.length} Categories Added`,
  ].filter(Boolean) as string[];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contestUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
      // Fallback copy
      const textArea = document.createElement("textarea");
      textArea.value = contestUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  const generateQrCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(contestUrl, {
        errorCorrectionLevel: "M",
        margin: 1,
        color: {
          dark: "#000000FF",
          light: "#FFFFFFFF",
        },
        width: 256,
      });
      setQrCodeDataUrl(dataUrl);
      setShowQrCode(true);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  const downloadQrCode = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement("a");
    link.download = "contest-qr-code.png";
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeQrCode = () => {
    setShowQrCode(false);
    setQrCodeDataUrl("");
  };

  const scrollToWelcomeMessage = () => {
    const element = document.getElementById("welcome-message-card");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToCategories = () => {
    const element = document.getElementById("categories-card");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToReviewSubmissions = () => {
    const element = document.getElementById("review-submissions-card");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <Card className="border-positive">
      <CardHeader>
        <CardTitle className="text-positive">Step-By-Step Guide</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                contest.created_at
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-gray-100 text-gray-500 border-gray-300"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">
                Create Contest
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Created{" "}
                {contest.created_at
                  ? formatUtcToLocal(contest.created_at)
                  : "Not created yet"}
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                contest.title &&
                contest.welcome_message &&
                categories.length > 0
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-blue-100 text-blue-800 border-blue-300"
              }`}
            >
              {contest.title &&
              contest.welcome_message &&
              categories.length > 0 ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">
                Setup Contest
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {allComplete
                  ? "Contest is ready to share"
                  : `Configure your contest info${completedItems.length > 0 ? `: ${completedItems.join(", ")}` : ""}`}
              </div>
              {!allComplete && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {!titleComplete && (
                    <Button variant="default" size="sm">
                      Add Title
                    </Button>
                  )}
                  {!welcomeComplete && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={scrollToWelcomeMessage}
                    >
                      Add Welcome Message
                    </Button>
                  )}
                  {!categoriesComplete && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={scrollToCategories}
                    >
                      Add Categories
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-indigo-100 text-indigo-800 border-indigo-300">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">
                Share Contest
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Share your contest with participants using this link:{" "}
                <a
                  href={contestUrl}
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  {contestUrl}
                </a>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={copied}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy URL
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={generateQrCode}>
                  <QrCode className="h-4 w-4 mr-2" />
                  View QR Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/poster/${contestId}`, "_blank")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Poster
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                contest.contest_started_at
                  ? "bg-green-100 text-green-800 border-green-300"
                  : categories.length > 0
                    ? "bg-blue-100 text-blue-800 border-blue-300"
                    : "bg-gray-100 text-gray-500 border-gray-300"
              }`}
            >
              {contest.contest_started_at ? (
                <CheckCircle className="w-4 h-4" />
              ) : categories.length > 0 ? (
                <Play className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">
                Start Contest
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {contest.contest_started_at
                  ? `Started ${formatUtcToLocal(contest.contest_started_at)}`
                  : categories.length > 0
                    ? "Begin accepting photo submissions"
                    : "Available after adding categories"}
              </div>
              {contest.contest_started_at && submissions.length > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  {submissions.length} submission
                  {submissions.length === 1 ? "" : "s"} received
                </div>
              )}
              {categories.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {contest.contest_started_at && submissions.length > 0 && (
                    <Button size="sm" onClick={scrollToReviewSubmissions}>
                      Review {submissions.length} Submission
                      {submissions.length === 1 ? "" : "s"}
                    </Button>
                  )}
                  <form
                    action={
                      contest.contest_started_at ? unstartContest : startContest
                    }
                  >
                    <input type="hidden" name="contestId" value={contestId} />
                    <Button
                      type="submit"
                      variant={
                        contest.contest_started_at ? "outline" : "default"
                      }
                      size="sm"
                    >
                      {contest.contest_started_at
                        ? "Unstart Contest"
                        : "Start Contest"}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                contest.votes_counted_at
                  ? "bg-green-100 text-green-800 border-green-300"
                  : contest.contest_started_at
                    ? "bg-orange-100 text-orange-800 border-orange-300"
                    : "bg-gray-100 text-gray-500 border-gray-300"
              }`}
            >
              {contest.votes_counted_at ? (
                <CheckCircle className="w-4 h-4" />
              ) : contest.contest_started_at ? (
                <Play className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">
                Count Votes
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {contest.votes_counted_at
                  ? `Votes counted ${formatUtcToLocal(contest.votes_counted_at)}`
                  : contest.contest_started_at
                    ? "Tally all votes and prepare winners"
                    : "Available after contest starts"}
              </div>
              {contest.contest_started_at && (
                <form
                  action={contest.votes_counted_at ? uncountVotes : countVotes}
                  className="mt-2"
                >
                  <input type="hidden" name="contestId" value={contestId} />
                  <Button
                    type="submit"
                    variant={contest.votes_counted_at ? "outline" : "default"}
                    size="sm"
                    disabled={!contest.contest_started_at}
                  >
                    {contest.votes_counted_at ? "Uncount Votes" : "Count Votes"}
                  </Button>
                </form>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                contest.contest_ended_at
                  ? "bg-green-100 text-green-800 border-green-300"
                  : contest.contest_started_at && contest.votes_counted_at
                    ? "bg-purple-100 text-purple-800 border-purple-300"
                    : "bg-gray-100 text-gray-500 border-gray-300"
              }`}
            >
              {contest.contest_ended_at ? (
                <CheckCircle className="w-4 h-4" />
              ) : contest.contest_started_at && contest.votes_counted_at ? (
                <Play className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">
                End Contest
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {contest.contest_ended_at
                  ? `Contest ended ${formatUtcToLocal(contest.contest_ended_at)}`
                  : contest.contest_started_at && contest.votes_counted_at
                    ? "Finalize contest and reveal winners"
                    : "Available after votes are counted"}
              </div>
              {contest.contest_started_at && contest.votes_counted_at && (
                <form
                  action={contest.contest_ended_at ? unendContest : endContest}
                  className="mt-2"
                >
                  <input type="hidden" name="contestId" value={contestId} />
                  <Button
                    type="submit"
                    variant={contest.contest_ended_at ? "outline" : "default"}
                    size="sm"
                    disabled={
                      !contest.contest_started_at || !contest.votes_counted_at
                    }
                  >
                    {contest.contest_ended_at ? "Unend Contest" : "End Contest"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQrCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Contest QR Code</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeQrCode}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {qrCodeDataUrl && (
                <div className="text-center space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeDataUrl}
                    alt="Contest QR Code"
                    className="mx-auto border rounded"
                  />
                  <p className="text-sm text-muted-foreground">
                    Scan this QR code to access the contest
                  </p>
                  <Button
                    onClick={downloadQrCode}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

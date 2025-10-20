"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, Download, QrCode, X, FileText } from "lucide-react";
import QRCode from "qrcode";

interface ContestUrlSectionProps {
  contestUrl: string;
  contestId: string;
}

export function ContestUrlSection({
  contestUrl,
  contestId,
}: ContestUrlSectionProps) {
  const [copied, setCopied] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contestUrl);
      setCopied(true);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
      // Fallback for browsers that don't support clipboard API
      fallbackCopy(contestUrl);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Fallback copy failed:", error);
    } finally {
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

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Contest URL</h3>
            <div className="bg-muted p-3 rounded text-sm font-mono">
              {contestUrl}
            </div>
          </div>
          <div className="flex gap-2">
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
                  Copy
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={generateQrCode}>
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR Code
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
        </div>
      </CardContent>
    </Card>
  );
}

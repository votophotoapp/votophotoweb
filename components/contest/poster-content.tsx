"use client";

import { PosterQRCode } from "@/components/contest/poster-qr-code";
import { Contest } from "@/lib/database-types";

interface PosterContentProps {
  contest: Contest;
  contestUrl: string;
}

export function PosterContent({ contest, contestUrl }: PosterContentProps) {
  return (
    <>
      {/* Print-specific styles */}
      <style jsx>{`
        @media print {
          @page {
            margin: 0.5in;
            size: portrait;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .print-container {
            page-break-inside: avoid;
          }

          .qr-section {
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="min-h-screen bg-white text-black print:min-h-0">
        {/* Print button - hidden when printing */}
        <div className="print:hidden fixed top-4 right-4 z-10">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Print Poster
          </button>
        </div>

        {/* Main poster content */}
        <div className="print-container max-w-5xl mx-auto p-8 space-y-8 print:p-6 print:max-w-none print:space-y-6">
          {/* Header */}
          <div className="text-center space-y-4 print:space-y-3">
            <h1 className="text-5xl font-bold text-gray-900 print:text-4xl print:leading-tight">
              {contest.title}
            </h1>
            <p className="text-xl text-gray-600 print:text-lg">Photo Contest</p>
          </div>

          {/* QR Code and Instructions */}
          <div className="qr-section bg-gray-50 rounded-lg p-8 text-center space-y-6 print:bg-white print:border-2 print:border-gray-400 print:p-6 print:space-y-4">
            <div className="space-y-4 print:space-y-3">
              <h2 className="text-2xl font-semibold text-gray-900 print:text-xl">
                Join the Contest
              </h2>
              <div className="text-lg text-gray-700 space-y-2 print:text-base print:space-y-1">
                <p>1. Scan the QR code below with your phone</p>
                <p>2. Upload your best photos</p>
                <p>3. Vote for your favorites</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center print:my-4">
              <PosterQRCode contestUrl={contestUrl} />
            </div>

            {/* Contest URL */}
            <div className="space-y-2 print:space-y-1">
              <p className="text-lg font-semibold text-gray-900 print:text-base">
                Or visit:
              </p>
              <div className="bg-white p-4 rounded border font-mono text-lg break-all print:text-sm print:border-2 print:border-gray-400 print:p-3">
                {contestUrl}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 print:mt-8 print:space-y-1">
            <p className="text-gray-600 print:text-base">
              Powered by VotoPhoto
            </p>
            <p className="text-sm text-gray-500 print:text-xs">
              Share your memories, vote for the best!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

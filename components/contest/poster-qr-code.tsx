"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface PosterQRCodeProps {
  contestUrl: string;
}

export function PosterQRCode({ contestUrl }: PosterQRCodeProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  useEffect(() => {
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
      } catch (error) {
        console.error("Failed to generate QR code:", error);
      }
    };

    generateQrCode();
  }, [contestUrl]);

  if (!qrCodeDataUrl) {
    return (
      <div className="w-64 h-64 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center print:w-48 print:h-48 print:border-gray-500">
        <div className="text-center space-y-2">
          <div className="text-gray-500 print:text-xs">Generating</div>
          <div className="text-gray-500 print:text-xs">QR Code...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 h-64 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center p-2 print:w-48 print:h-48 print:border-gray-500">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrCodeDataUrl}
        alt="Contest QR Code"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

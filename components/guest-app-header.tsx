"use client";

import Link from "next/link";
import Image from "next/image";

interface GuestAppHeaderProps {
  title?: string;
}

export function GuestAppHeader({ title }: GuestAppHeaderProps) {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-white">
      <div className="w-full max-w-5xl flex items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link
            href={"/"}
            className="flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <div className="h-8 flex items-center justify-center">
              <Image
                src="/images/votophoto-logo-square.svg"
                alt="VotoPhoto"
                width={24}
                height={24}
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>
          {title && <span className="text-lg">{title}</span>}
        </div>
      </div>
    </nav>
  );
}

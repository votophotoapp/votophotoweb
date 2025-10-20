"use client";

import Link from "next/link";
import { AuthButton } from "@/components/auth/auth-button";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";

interface AppHeaderProps {
  showAuthButton?: boolean;
}

export function AppHeader({ showAuthButton = false }: AppHeaderProps) {
  const { user, loading } = useAuth();

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-white">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link
            href={"/"}
            className="flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <div className="h-8 flex items-center justify-center">
              <Image
                src="/images/votophoto-logo-wide.svg"
                alt="VotoPhoto"
                width={98}
                height={24}
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>

          {/* Authenticated navigation links */}
          {user && !loading && (
            <nav className="flex items-center space-x-4">
              <Link
                href="/manage/contests"
                className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
              >
                Contests
              </Link>
            </nav>
          )}
        </div>

        {/* Right side navigation */}
        <div className="flex items-center gap-4">
          {!showAuthButton && !user && (
            <nav className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
              >
                Home
              </Link>
            </nav>
          )}

          {showAuthButton && <AuthButton />}
        </div>
      </div>
    </nav>
  );
}

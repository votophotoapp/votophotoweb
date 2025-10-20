"use client";

import { Button } from "../ui/button";
import { GoogleSignInButton } from "./google-signin-button";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User } from "lucide-react";

export function AuthButton() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleGoogleSuccess = () => {
    // User will be redirected automatically
    router.refresh();
  };

  const handleGoogleError = (errorMessage: string) => {
    console.error("Google auth error:", errorMessage);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled>
          Loading...
        </Button>
      </div>
    );
  }

  return user ? (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => router.push("/manage/profile")}
        size="sm"
        variant="ghost"
        className="text-sm flex items-center gap-2"
      >
        {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
          <Image
            src={user.user_metadata.avatar_url || user.user_metadata.picture}
            alt="Profile"
            width={20}
            height={20}
            className="w-5 h-5 rounded-full"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-3 h-3 text-gray-500" />
          </div>
        )}
        My Profile
      </Button>
      <Button onClick={handleSignOut} size="sm" variant="outline">
        Logout
      </Button>
    </div>
  ) : (
    <div className="flex gap-2">
      <GoogleSignInButton
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        buttonConfig={{
          type: "standard",
          theme: "outline",
          size: "medium",
          text: "signin_with",
          shape: "pill",
          logo_alignment: "left",
        }}
        showOneTap={true}
      />
    </div>
  );
}

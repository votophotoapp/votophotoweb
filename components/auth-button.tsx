"use client";

import { Button } from "./ui/button";
import { GoogleSignInButton } from "./google-signin-button";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

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
      <span className="text-sm text-foreground/60">Hey, {user.email}!</span>
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

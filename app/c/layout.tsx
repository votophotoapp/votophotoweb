"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ContestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    const ensureAuthenticated = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          console.log("No user found, signing in anonymously...");
          const { error } = await supabase.auth.signInAnonymously();
          if (error) {
            console.error("Failed to sign in anonymously:", error);
          } else {
            console.log("Successfully signed in anonymously");
          }
        } else {
          console.log("User already authenticated:", user.id);
        }
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        setIsAuthenticating(false);
      }
    };

    ensureAuthenticated();
  }, []);

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

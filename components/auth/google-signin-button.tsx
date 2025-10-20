"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleInitConfig) => void;
          prompt: () => void;
          renderButton: (
            element: HTMLElement,
            config: GoogleButtonConfig,
          ) => void;
        };
      };
    };
  }
}

interface GoogleInitConfig {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  nonce?: string;
  use_fedcm_for_prompt?: boolean;
}

interface GoogleButtonConfig {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
}

interface CredentialResponse {
  credential: string;
  select_by?: string;
}

// Generate nonce for security
const generateNonce = async (): Promise<[string, string]> => {
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
  );
  const encoder = new TextEncoder();
  const encodedNonce = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return [nonce, hashedNonce];
};

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  buttonConfig?: GoogleButtonConfig;
  showOneTap?: boolean;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  buttonConfig = {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "signin_with",
    shape: "pill",
    logo_alignment: "left",
    width: 300,
  },
  showOneTap = true,
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignInWithGoogle = useCallback(
    async (response: CredentialResponse, nonce: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.credential,
          nonce,
        });

        if (error) throw error;

        console.log("Successfully logged in with Google:", data);
        onSuccess?.();
        router.push("/manage/contests");
      } catch (error) {
        console.error("Error logging in with Google:", error);
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        onError?.(errorMessage);
      }
    },
    [supabase, onSuccess, onError, router],
  );

  useEffect(() => {
    const initializeGoogleSignIn = async () => {
      if (!window.google?.accounts?.id) {
        console.error("Google Sign-In library not loaded");
        return;
      }

      try {
        // Check if user is already authenticated
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          router.push("/manage/contests");
          return;
        }

        const [nonce, hashedNonce] = await generateNonce();

        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: async (response: CredentialResponse) => {
            await handleSignInWithGoogle(response, nonce);
          },
          nonce: hashedNonce,
          use_fedcm_for_prompt: true, // For Chrome's third-party cookie phase-out
        });

        // Render the sign-in button
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(
            buttonRef.current,
            buttonConfig,
          );
        }

        // Show One Tap if enabled
        if (showOneTap) {
          window.google.accounts.id.prompt();
        }
      } catch (error) {
        console.error("Failed to initialize Google Sign-In:", error);
        onError?.("Failed to initialize Google Sign-In");
      }
    };

    // Load Google Sign-In script if not already loaded
    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    } else {
      initializeGoogleSignIn();
    }
  }, [
    buttonConfig,
    showOneTap,
    onError,
    router,
    supabase,
    handleSignInWithGoogle,
  ]);

  return (
    <div className="google-signin-container">
      <div ref={buttonRef} id="google-signin-button" />
      {showOneTap && (
        <div
          id="g_id_onload"
          data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
          data-context="signin"
          data-ux_mode="popup"
          data-auto_select="true"
          data-itp_support="true"
          data-use_fedcm_for_prompt="true"
          style={{ display: "none" }}
        />
      )}
    </div>
  );
}

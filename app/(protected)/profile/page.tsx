import { redirect } from "next/navigation";
import Image from "next/image";

import { createClient } from "@/lib/supabase/server";
import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/");
  }

  // Extract user information from Google OAuth
  const userMetadata = user.user_metadata;
  const userName = userMetadata?.full_name || userMetadata?.name || user.email;
  const userEmail = user.email;
  const userAvatar = userMetadata?.avatar_url || userMetadata?.picture;
  const provider = user.app_metadata?.provider;

  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-4xl mx-auto p-6">
      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt="Profile"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">Welcome, {userName}!</h1>
              <p className="text-sm text-muted-foreground">
                Signed in via {provider === "google" ? "Google" : provider}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Email:</span> {userEmail}
            </div>
            <div>
              <span className="font-medium">Last Sign In:</span>{" "}
              {user.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleString()
                : "N/A"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

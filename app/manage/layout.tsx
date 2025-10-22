import { AppHeader } from "@/components/app-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 w-full flex flex-col gap-4">
        <AppHeader showAuthButton={true} />
        <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col gap-4 p-5">
          {children}
        </div>

        <Footer />
      </div>
    </main>
  );
}

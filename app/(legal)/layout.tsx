import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      <AppHeader showAuthButton={true} />
      <div className="flex-1 w-full max-w-5xl mx-auto p-5">{children}</div>
      <Footer />
    </main>
  );
}

import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full flex justify-center border-t bg-background">
      <div className="w-full max-w-5xl p-3 px-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-5">
          <Link href="/" className="text-sm font-bold hover:underline">
            VotoPhoto
          </Link>
          <div className="flex gap-6 text-sm">
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
          <div className="text-xs text-muted-foreground">
            Built with care in Roswell, GA
          </div>
        </div>
      </div>
    </footer>
  );
}

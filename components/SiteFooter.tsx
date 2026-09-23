import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <BrandLogo variant="mark" height={22} decorative />
          <div>
            <p className="text-xs text-slate-500">© 2026 {SITE_NAME}</p>
            <p className="text-[11px] text-slate-400">{SITE_TAGLINE}</p>
          </div>
        </div>
        <nav className="flex items-center gap-5">
          <Link
            href="/privacy"
            className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}

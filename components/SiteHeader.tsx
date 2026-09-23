import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandLogo variant="mark" height={32} decorative priority />
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              {SITE_NAME}
            </span>
            <span className="hidden text-[11px] leading-none text-slate-500 sm:block">
              {SITE_TAGLINE}
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/generate"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Create
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Pricing
          </Link>
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-slate-900">
          Growth Assistant
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/generate"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Generate
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

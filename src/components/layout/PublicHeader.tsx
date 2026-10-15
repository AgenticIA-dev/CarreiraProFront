import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="border-b border-ink-100">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-ink-900">
          Carreira<span className="text-brand-600">Pro</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            Entrar
          </Link>
          <Link
            href="/comprar"
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Comprar
          </Link>
        </nav>
      </div>
    </header>
  );
}

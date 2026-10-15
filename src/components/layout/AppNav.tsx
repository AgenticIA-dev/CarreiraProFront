"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, Mic, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/perguntas", label: "Perguntas", icon: ListChecks },
  { href: "/app/star", label: "Método STAR", icon: Sparkles },
  { href: "/app/simulador", label: "Simulador", icon: Mic },
  { href: "/app/perfil", label: "Perfil", icon: User },
];

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname.startsWith(href);
}

/** Sidebar de navegação — visível em telas médias/grandes (desktop). */
export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegação principal" className="hidden w-60 shrink-0 border-r border-ink-100 bg-white p-4 md:flex md:flex-col">
      <Link href="/app" className="mb-6 px-2 text-lg font-semibold tracking-tight text-ink-900">
        Carreira<span className="text-brand-600">Pro</span>
      </Link>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                )}
              >
                <item.icon className="h-4.5 w-4.5" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Bottom navigation — visível apenas em telas pequenas (mobile), conforme §9. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-ink-100 bg-white pb-[env(safe-area-inset-bottom,0px)] md:hidden"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
              active ? "text-brand-600" : "text-ink-500"
            )}
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

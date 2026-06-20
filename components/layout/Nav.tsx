import Link from "next/link";

import { LiveIndicator } from "./LiveIndicator";
import { SignOutButton } from "./SignOutButton";

const links = [
  { href: "/dashboard", label: "Fromagerie" },
  { href: "/alertes", label: "Alertes" },
  { href: "/monitoring", label: "Monitoring" },
];

export function Nav() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">
              La Ferme des Brebiquettes
            </p>
            <h1 className="text-lg font-semibold text-stone-900">
              Surveillance qualité temps réel
            </h1>
          </div>
          <SignOutButton />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
          <LiveIndicator />
          <nav className="flex flex-wrap gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

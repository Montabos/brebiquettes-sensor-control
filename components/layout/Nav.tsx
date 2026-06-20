import Link from "next/link";

import { LiveIndicator } from "./LiveIndicator";

const links = [
  { href: "/dashboard", label: "Fromagerie" },
  { href: "/alertes", label: "Alertes" },
  { href: "/monitoring", label: "Monitoring" },
];

export function Nav() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">
            La Ferme des Brebiquettes
          </p>
          <h1 className="text-lg font-semibold text-stone-900">
            Surveillance qualité temps réel
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator />
          <nav className="flex gap-1">
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
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

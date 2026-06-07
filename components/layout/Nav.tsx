import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Accueil" },
  { href: "/zones", label: "Zones" },
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
      </div>
    </header>
  );
}

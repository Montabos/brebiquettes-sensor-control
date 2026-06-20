import { Nav } from "@/components/layout/Nav";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </>
  );
}

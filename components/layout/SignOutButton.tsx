"use client";

import { useEffect, useState } from "react";

import { createBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, []);

  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      {email ? (
        <span className="hidden max-w-[160px] truncate text-xs text-stone-500 sm:inline sm:max-w-[200px] sm:text-sm">
          {email}
        </span>
      ) : null}
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="whitespace-nowrap rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm transition hover:bg-stone-50 sm:text-sm"
        >
          Déconnexion
        </button>
      </form>
    </div>
  );
}

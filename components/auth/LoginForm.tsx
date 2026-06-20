"use client";

import { createClient } from "@/lib/supabase/client";
import { isValidSupabaseUrl } from "@/lib/auth-redirect";
import { useState } from "react";

interface LoginFormProps {
  nextPath: string;
  errorCode?: string | null;
}

const ERROR_MESSAGES: Record<string, string> = {
  oauth: "La connexion Google a échoué. Réessayez.",
  unauthorized:
    "Cette adresse e-mail n'est pas autorisée à accéder au dashboard.",
};

export function LoginForm({ nextPath, errorCode }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorCode ? (ERROR_MESSAGES[errorCode] ?? "Connexion impossible.") : null
  );

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!isValidSupabaseUrl(supabaseUrl)) {
      setError(
        "Configuration Supabase incorrecte : NEXT_PUBLIC_SUPABASE_URL doit être https://fpnhabujwtjzjuhfvrgx.supabase.co"
      );
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const appOrigin =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      window.location.origin;
    const redirectTo = `${appOrigin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { prompt: "select_account" },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">
          La Ferme des Brebiquettes
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">Connexion</h1>
        <p className="mt-2 text-sm text-stone-500">
          Surveillance capteurs — connectez-vous avec Google.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-50 disabled:opacity-50"
      >
        <GoogleIcon />
        {loading ? "Redirection..." : "Continuer avec Google"}
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c3.42-3.15 5.384-7.79 5.384-13.315z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

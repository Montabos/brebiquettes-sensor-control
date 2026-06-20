import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createServerClient } from "./supabase/server";

export function isEmailAllowed(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length > 0 && allowedEmails.includes(normalized)) {
    return true;
  }

  const domain = (process.env.ALLOWED_EMAIL_DOMAIN ?? "").trim().toLowerCase();
  if (domain && normalized.endsWith(`@${domain}`)) {
    return true;
  }

  if (allowedEmails.length === 0 && !domain) {
    return true;
  }

  return false;
}

export async function getAuthUser(): Promise<User | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isEmailAllowed(user.email)) {
    return null;
  }

  return user;
}

export async function requireApiUser() {
  const user = await getAuthUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Non autorisé" }, { status: 401 }),
    };
  }
  return { user, response: null };
}

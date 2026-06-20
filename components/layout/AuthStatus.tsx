import { getAuthUser } from "@/lib/auth";

export async function AuthStatus() {
  const user = await getAuthUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center gap-3">
      <span className="hidden max-w-[180px] truncate text-sm text-stone-500 md:inline">
        {user.email}
      </span>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
        >
          Déconnexion
        </button>
      </form>
    </div>
  );
}

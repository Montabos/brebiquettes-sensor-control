import { LoginForm } from "@/components/auth/LoginForm";
import { sanitizeNextPath } from "@/lib/auth-redirect";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <LoginForm nextPath={nextPath} errorCode={params.error ?? null} />
    </div>
  );
}

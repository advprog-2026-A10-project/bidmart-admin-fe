import { useSearchParams } from "react-router";
import { AuthCard } from "../components/auth-card";
import { VerifyEmailContent } from "../components/verify-email-content";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? undefined;
  const email = searchParams.get("email") ?? undefined;

  return (
    <AuthCard
      title="Verify your email"
      description={token ? undefined : "Check your inbox for the verification link."}
    >
      <VerifyEmailContent token={token} email={email} />
    </AuthCard>
  );
}

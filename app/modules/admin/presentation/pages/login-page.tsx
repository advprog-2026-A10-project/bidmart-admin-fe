import { useNavigate } from "react-router";
import { AuthCard } from "../components/auth-card";
import { LoginForm } from "../components/login-form";
import { useLoginMutation } from "../hooks/use-login-mutation";
import type { LoginFormValues } from "../components/login-form";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLoginMutation();

  function handleSubmit(values: LoginFormValues) {
    login.mutate(
      { email: values.email, password: values.password },
      { onSuccess: () => navigate("/posts") },
    );
  }

  return (
    <AuthCard title="Sign in" description="Enter your credentials to access your account.">
      <LoginForm onSubmit={handleSubmit} isSubmitting={login.isPending} />
    </AuthCard>
  );
}

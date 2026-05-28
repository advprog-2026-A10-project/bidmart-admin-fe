import { useNavigate } from "react-router";
import { AuthCard } from "../components/auth-card";
import { RegisterForm } from "../components/register-form";
import { useRegisterMutation } from "../hooks/use-register-mutation";
import type { RegisterFormValues } from "../components/register-form";

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegisterMutation();

  function handleSubmit(values: RegisterFormValues) {
    register.mutate(
      { name: values.name, email: values.email, password: values.password },
      {
        onSuccess: () => {
          navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
        },
      },
    );
  }

  return (
    <AuthCard title="Create an account" description="Fill in the details below to get started.">
      <RegisterForm onSubmit={handleSubmit} isSubmitting={register.isPending} />
    </AuthCard>
  );
}

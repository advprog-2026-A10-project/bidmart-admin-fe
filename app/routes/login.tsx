import { LoginPage } from "~/modules/auth/presentation/pages/login-page";
import { redirect } from "react-router";
import { getAdminSession } from "~/modules/admin/presentation/utils/admin-dashboard.server";

export async function loader({ request }: { request: Request }) {
  const session = await getAdminSession(request);
  if (session) {
    return redirect("/admin/users");
  }
  return null;
}

export default function LoginRoute() {
  return <LoginPage />;
}

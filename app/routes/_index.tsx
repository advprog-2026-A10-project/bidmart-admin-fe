import { redirect } from "react-router";
import { getAdminSession } from "~/modules/admin/presentation/utils/admin-dashboard.server";

export async function loader({ request }: { request: Request }) {
  const session = await getAdminSession(request);
  return session ? redirect("/admin/users") : redirect("/login");
}

export default function Index() {
  return null;
}

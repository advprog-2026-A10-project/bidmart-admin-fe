import { redirect } from "react-router";
import { requireAdminSession } from "~/modules/admin/presentation/utils/admin-dashboard.server";

export async function loader({ request }: { request: Request }) {
  await requireAdminSession(request);
  return redirect("/admin/users");
}

export default function DashboardRoute() {
  return null;
}

import { Link, useLoaderData } from "react-router";
import { ArrowLeft, Ban, CircleCheck, LogIn } from "lucide-react";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import type { AdminManagedUser } from "~/modules/admin/presentation/utils/admin-dashboard.server";
import {
  fetchManagedUserById,
  formatDateTime,
  getMockUserById,
  requireAdminSession,
} from "~/modules/admin/presentation/utils/admin-dashboard.server";

type LoaderData = {
  user: AdminManagedUser;
};

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { userId?: string };
}) {
  await requireAdminSession(request);
  const userId = params.userId ?? "";
  const user = (await fetchManagedUserById(request, userId)) ?? getMockUserById(userId);
  if (!user) throw new Response("User not found", { status: 404 });
  return { user };
}

function statusBadgeVariant(status: AdminManagedUser["status"]) {
  if (status === "ACTIVE") return "ghost";
  if (status === "DISABLED") return "destructive";
  return "secondary";
}

export default function AdminUserDetailRoute() {
  const { user } = useLoaderData() as LoaderData;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/users">
            <ArrowLeft className="size-4" />
            Back to Users
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link to={`/admin/users/${user.id}/sessions`}>
            <LogIn className="size-4" />
            View Sessions
          </Link>
        </Button>
      </div>

      <Card className="gap-4">
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>User ID: {user.id}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Email</p>
            <p className="text-sm font-medium break-all">{user.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Status</p>
            <Badge variant={statusBadgeVariant(user.status)}>{user.status}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Roles</p>
            <p className="text-sm">{user.roles.join(", ")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Active Sessions</p>
            <p className="text-sm">{user.activeSessions}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Created At</p>
            <p className="text-sm">{formatDateTime(user.createdAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Last Seen</p>
            <p className="text-sm">{user.lastSeenAt ? formatDateTime(user.lastSeenAt) : "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Email Verified</p>
            <p className="text-sm">{user.emailVerified ? "Yes" : "No"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">MFA Enabled</p>
            <p className="text-sm">{user.mfaEmailEnabled || user.mfaTotpEnabled ? "Yes" : "No"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-3">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Placeholder aksi moderasi untuk WBS 1.4.5+ (akan disambungkan ke endpoint admin-be).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled>
            <Ban className="size-4" />
            Suspend User
          </Button>
          <Button variant="outline" size="sm" disabled>
            <CircleCheck className="size-4" />
            Reactivate User
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

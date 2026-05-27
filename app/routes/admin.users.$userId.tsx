import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";
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
  reactivateManagedUserById,
  requireAdminSession,
  suspendManagedUserById,
} from "~/modules/admin/presentation/utils/admin-dashboard.server";

type LoaderData = {
  user: AdminManagedUser;
};

type ActionData = {
  success?: string;
  error?: string;
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

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { userId?: string };
}) {
  await requireAdminSession(request);
  const userId = params.userId ?? "";
  if (!userId) {
    return { error: "Invalid user id." } satisfies ActionData;
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent === "suspend") {
    const result = await suspendManagedUserById(request, userId);
    if (!result.data) {
      return { error: result.message ?? "Gagal suspend user." } satisfies ActionData;
    }
    return {
      success: `${result.data.message} (${result.data.revokedCount} session)`,
    } satisfies ActionData;
  }

  if (intent === "reactivate") {
    const result = await reactivateManagedUserById(request, userId);
    if (!result.data) {
      return { error: result.message ?? "Gagal reactivate user." } satisfies ActionData;
    }
    return { success: result.data.message } satisfies ActionData;
  }

  return { error: "Invalid action." } satisfies ActionData;
}

function statusBadgeVariant(status: AdminManagedUser["status"]) {
  if (status === "ACTIVE") return "ghost";
  if (status === "DISABLED") return "destructive";
  return "secondary";
}

export default function AdminUserDetailRoute() {
  const { user } = useLoaderData() as LoaderData;
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isDisabled = user.status === "DISABLED";

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
          <CardDescription>Aksi suspend/reactivate user dan invalidasi session global.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {actionData?.success && <p className="text-sm text-emerald-600">{actionData.success}</p>}
          {actionData?.error && <p className="text-sm text-destructive">{actionData.error}</p>}

          <div className="flex flex-wrap gap-2">
            <Form method="post">
              <Button
                variant="destructive"
                size="sm"
                name="intent"
                value="suspend"
                disabled={isSubmitting || isDisabled}
              >
                <Ban className="size-4" />
                {isSubmitting ? "Processing..." : "Suspend User"}
              </Button>
            </Form>
            <Form method="post">
              <Button
                variant="outline"
                size="sm"
                name="intent"
                value="reactivate"
                disabled={isSubmitting || !isDisabled}
              >
                <CircleCheck className="size-4" />
                {isSubmitting ? "Processing..." : "Reactivate User"}
              </Button>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

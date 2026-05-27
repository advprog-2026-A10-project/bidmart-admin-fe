import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";
import { ArrowLeft, ShieldAlert, Slash } from "lucide-react";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";
import type { AdminManagedUser, AdminUserSession } from "~/modules/admin/presentation/utils/admin-dashboard.server";
import {
  fetchManagedUserById,
  fetchManagedUserSessionsById,
  formatDateTime,
  getMockSessionsByUserId,
  getMockUserById,
  revokeAllManagedUserSessionsById,
  revokeManagedUserSessionById,
  requireAdminSession,
} from "~/modules/admin/presentation/utils/admin-dashboard.server";

type LoaderData = {
  user: AdminManagedUser;
  sessions: AdminUserSession[];
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
  const sessions = (await fetchManagedUserSessionsById(request, userId)) ?? getMockSessionsByUserId(userId);
  return { user, sessions };
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

  if (intent === "revoke_one") {
    const sessionId = String(formData.get("sessionId") ?? "");
    if (!sessionId) {
      return { error: "Invalid session id." } satisfies ActionData;
    }

    const result = await revokeManagedUserSessionById(request, userId, sessionId);
    if (!result.data) {
      return { error: result.message ?? "Gagal revoke session." } satisfies ActionData;
    }

    return { success: result.data.message } satisfies ActionData;
  }

  if (intent === "revoke_all") {
    const result = await revokeAllManagedUserSessionsById(request, userId);
    if (!result.data) {
      return { error: result.message ?? "Gagal revoke semua session." } satisfies ActionData;
    }

    return {
      success: `${result.data.message} (${result.data.revokedCount} session)`,
    } satisfies ActionData;
  }

  return { error: "Invalid action." } satisfies ActionData;
}

function sessionStatusVariant(status: AdminUserSession["status"]) {
  return status === "ACTIVE" ? "ghost" : "outline";
}

export default function AdminUserSessionsRoute() {
  const { user, sessions } = useLoaderData() as LoaderData;
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const activeSessionsCount = sessions.filter((session) => session.status === "ACTIVE").length;

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>Sessions: {user.name}</CardTitle>
            <CardDescription>User ID: {user.id}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Form method="post">
              <Button
                size="sm"
                variant="destructive"
                name="intent"
                value="revoke_all"
                disabled={isSubmitting || activeSessionsCount === 0}
              >
                <Slash className="size-4" />
                {isSubmitting ? "Processing..." : `Revoke All Active (${activeSessionsCount})`}
              </Button>
            </Form>
            <Button asChild size="sm" variant="outline">
              <Link to={`/admin/users/${user.id}`}>
                <ArrowLeft className="size-4" />
                Back to Detail
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {actionData?.success && <p className="mb-3 text-sm text-emerald-600">{actionData.success}</p>}
        {actionData?.error && <p className="mb-3 text-sm text-destructive">{actionData.error}</p>}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>MFA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="max-w-[11rem] truncate">{session.device}</TableCell>
                <TableCell>{session.ipAddress}</TableCell>
                <TableCell className="max-w-[10rem] truncate">
                  {[session.browser, session.os].filter(Boolean).join(" / ") || "-"}
                </TableCell>
                <TableCell>{session.location}</TableCell>
                <TableCell>{formatDateTime(session.startedAt)}</TableCell>
                <TableCell>{formatDateTime(session.lastActivityAt)}</TableCell>
                <TableCell>{session.mfaSatisfied ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <Badge variant={sessionStatusVariant(session.status)}>{session.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {session.status === "ACTIVE" ? (
                    <Form method="post" className="inline-flex">
                      <input type="hidden" name="sessionId" value={session.id} />
                      <Button
                        variant="outline"
                        size="sm"
                        name="intent"
                        value="revoke_one"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Processing..." : "Revoke"}
                      </Button>
                    </Form>
                  ) : (
                    <span className="text-muted-foreground text-xs">Revoked</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-muted-foreground py-8 text-center">
                  Tidak ada session aktif/riwayat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
          <ShieldAlert className="size-3.5" />
          Gunakan revoke jika ada session mencurigakan atau user melaporkan akun diakses pihak lain.
        </div>
      </CardContent>
    </Card>
  );
}

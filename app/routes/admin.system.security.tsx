import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
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
import type { AdminSystemSecuritySnapshot } from "~/modules/admin/presentation/utils/admin-dashboard.server";
import {
  fetchSystemSecuritySnapshot,
  formatDateTime,
  getMockSystemSecuritySnapshot,
  requireAdminSession,
  updateSystemSecurityPolicy,
} from "~/modules/admin/presentation/utils/admin-dashboard.server";

type LoaderData = {
  snapshot: AdminSystemSecuritySnapshot;
};

type ActionData = {
  success?: string;
  error?: string;
};

export async function loader({ request }: { request: Request }) {
  await requireAdminSession(request);
  const live = await fetchSystemSecuritySnapshot(request);
  return { snapshot: live ?? getMockSystemSecuritySnapshot() };
}

export async function action({ request }: { request: Request }) {
  await requireAdminSession(request);
  const formData = await request.formData();

  const maxConcurrentSessions = Number(formData.get("maxConcurrentSessions") ?? 0);
  const enforcementMode = String(formData.get("enforcementMode") ?? "").trim();
  const forceMfaForAdmin = formData.get("forceMfaForAdmin") === "on";

  if (!Number.isInteger(maxConcurrentSessions) || maxConcurrentSessions < 1) {
    return { error: "Max concurrent sessions minimal 1." } satisfies ActionData;
  }
  if (enforcementMode !== "REJECT_NEW" && enforcementMode !== "REVOKE_OLDEST") {
    return { error: "Invalid enforcement mode." } satisfies ActionData;
  }

  const result = await updateSystemSecurityPolicy(request, {
    maxConcurrentSessions,
    enforcementMode: enforcementMode as "REJECT_NEW" | "REVOKE_OLDEST",
    forceMfaForAdmin,
  });

  if (!result.data) {
    return { error: result.message ?? "Gagal update policy." } satisfies ActionData;
  }

  return { success: "Security policy berhasil diperbarui." } satisfies ActionData;
}

const selectClassName =
  "border-input bg-background focus-visible:border-primary focus-visible:ring-primary/20 h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]";

export default function AdminSystemSecurityRoute() {
  const { snapshot } = useLoaderData() as LoaderData;
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="space-y-4">
      <Card className="gap-4">
        <CardHeader>
          <CardTitle>System Security</CardTitle>
          <CardDescription>
            Pengaturan kebijakan sesi konkuren, audit login, dan konfigurasi keamanan global.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="gap-2">
            <CardHeader className="pb-0">
              <CardDescription>Active Sessions</CardDescription>
              <CardTitle>{snapshot.overview.activeSessions}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="gap-2">
            <CardHeader className="pb-0">
              <CardDescription>Users &gt;1 Session</CardDescription>
              <CardTitle>{snapshot.overview.usersWithMultipleSessions}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="gap-2">
            <CardHeader className="pb-0">
              <CardDescription>MFA Satisfied</CardDescription>
              <CardTitle>{snapshot.overview.mfaSatisfiedSessions}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="gap-2">
            <CardHeader className="pb-0">
              <CardDescription>MFA Unsatisfied</CardDescription>
              <CardTitle>{snapshot.overview.mfaUnsatisfiedSessions}</CardTitle>
            </CardHeader>
          </Card>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="gap-4">
          <CardHeader>
            <CardTitle>Concurrent Session Policy</CardTitle>
            <CardDescription>Updated: {formatDateTime(snapshot.policy.updatedAt)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {actionData?.success && <p className="text-sm text-emerald-600">{actionData.success}</p>}
            {actionData?.error && <p className="text-sm text-destructive">{actionData.error}</p>}

            <Form method="post" className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="maxConcurrentSessions">
                  Max Concurrent Sessions
                </label>
                <input
                  id="maxConcurrentSessions"
                  name="maxConcurrentSessions"
                  type="number"
                  min={1}
                  defaultValue={snapshot.policy.maxConcurrentSessions}
                  className={selectClassName}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="enforcementMode">
                  Enforcement Mode
                </label>
                <select
                  id="enforcementMode"
                  name="enforcementMode"
                  className={selectClassName}
                  defaultValue={snapshot.policy.enforcementMode}
                  disabled={isSubmitting}
                >
                  <option value="REVOKE_OLDEST">REVOKE_OLDEST</option>
                  <option value="REJECT_NEW">REJECT_NEW</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="forceMfaForAdmin"
                  defaultChecked={snapshot.policy.forceMfaForAdmin}
                  disabled={isSubmitting}
                />
                Force MFA for admin sessions
              </label>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Policy"}
              </Button>
            </Form>
          </CardContent>
        </Card>

        <Card className="gap-4">
          <CardHeader>
            <CardTitle>Runtime Security Config</CardTitle>
            <CardDescription>Nilai aktif dari runtime admin service.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cookie Name</span>
              <Badge variant="outline">{snapshot.runtime.sessionCookieName}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cookie Secure</span>
              <Badge variant={snapshot.runtime.sessionCookieSecure ? "secondary" : "outline"}>
                {snapshot.runtime.sessionCookieSecure ? "TRUE" : "FALSE"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">SameSite</span>
              <Badge variant="outline">{snapshot.runtime.sessionCookieSameSite}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Authz Cache TTL</span>
              <Badge variant="outline">{snapshot.runtime.authzCacheTtlSeconds}s</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Login Audit</CardTitle>
          <CardDescription>Updated at {formatDateTime(snapshot.generatedAt)}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>MFA</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshot.loginAudit.map((audit) => (
                <TableRow key={audit.sessionId}>
                  <TableCell className="max-w-[14rem]">
                    <p className="truncate font-medium">{audit.name}</p>
                    <p className="text-muted-foreground truncate text-xs">{audit.email}</p>
                  </TableCell>
                  <TableCell className="max-w-[12rem]">
                    <p className="truncate text-sm">{audit.device}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {[audit.browser, audit.os].filter(Boolean).join(" / ")}
                    </p>
                  </TableCell>
                  <TableCell>{audit.ip}</TableCell>
                  <TableCell>{audit.location}</TableCell>
                  <TableCell>{audit.mfaSatisfied ? "Yes" : "No"}</TableCell>
                  <TableCell>{formatDateTime(audit.createdAt)}</TableCell>
                  <TableCell>{formatDateTime(audit.lastActiveAt)}</TableCell>
                </TableRow>
              ))}
              {snapshot.loginAudit.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                    Belum ada data audit login.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

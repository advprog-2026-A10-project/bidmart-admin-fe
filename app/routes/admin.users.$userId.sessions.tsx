import { Link, useLoaderData } from "react-router";
import { ArrowLeft, ShieldAlert } from "lucide-react";
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
  requireAdminSession,
} from "~/modules/admin/presentation/utils/admin-dashboard.server";

type LoaderData = {
  user: AdminManagedUser;
  sessions: AdminUserSession[];
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

function sessionStatusVariant(status: AdminUserSession["status"]) {
  return status === "ACTIVE" ? "ghost" : "outline";
}

export default function AdminUserSessionsRoute() {
  const { user, sessions } = useLoaderData() as LoaderData;

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>Sessions: {user.name}</CardTitle>
            <CardDescription>User ID: {user.id}</CardDescription>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to={`/admin/users/${user.id}`}>
              <ArrowLeft className="size-4" />
              Back to Detail
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
              </TableRow>
            ))}
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                  Tidak ada session aktif/riwayat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
          <ShieldAlert className="size-3.5" />
          Aksi revoke session akan diaktifkan pada endpoint moderasi berikutnya.
        </div>
      </CardContent>
    </Card>
  );
}

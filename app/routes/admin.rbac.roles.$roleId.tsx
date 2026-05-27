import { Link, useLoaderData } from "react-router";
import { ArrowLeft } from "lucide-react";
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
import type { AdminRbacRoleDetail } from "~/modules/admin/presentation/utils/admin-dashboard.server";
import {
  fetchRbacRoleById,
  getMockRbacRoleById,
  requireAdminSession,
} from "~/modules/admin/presentation/utils/admin-dashboard.server";

type LoaderData = {
  role: AdminRbacRoleDetail;
};

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { roleId?: string };
}) {
  await requireAdminSession(request);
  const roleId = Number(params.roleId ?? NaN);
  if (!Number.isFinite(roleId) || roleId <= 0) {
    throw new Response("Role not found", { status: 404 });
  }

  const role = (await fetchRbacRoleById(request, roleId)) ?? getMockRbacRoleById(roleId);
  if (!role) throw new Response("Role not found", { status: 404 });
  return { role };
}

export default function AdminRbacRoleDetailRoute() {
  const { role } = useLoaderData() as LoaderData;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/rbac/roles">
            <ArrowLeft className="size-4" />
            Back to Roles
          </Link>
        </Button>
        <Badge variant="secondary">Role ID: {role.id}</Badge>
      </div>

      <Card className="gap-4">
        <CardHeader>
          <CardTitle>{role.name}</CardTitle>
          <CardDescription>Detail role dan daftar user yang saat ini memegang role ini.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs">Permissions</p>
            <div className="flex flex-wrap gap-1.5">
              {role.permissions.map((permission) => (
                <Badge key={permission} variant="outline">
                  {permission}
                </Badge>
              ))}
              {role.permissions.length === 0 && (
                <p className="text-muted-foreground text-sm">Belum ada permission untuk role ini.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Assigned Users</CardTitle>
          <CardDescription>User yang saat ini terhubung ke role ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {role.members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="max-w-[18rem]">
                    <p className="truncate font-medium">{member.name}</p>
                    <p className="text-muted-foreground truncate text-xs">{member.email}</p>
                  </TableCell>
                  <TableCell>{member.status}</TableCell>
                </TableRow>
              ))}
              {role.members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-muted-foreground py-8 text-center">
                    Belum ada user dengan role ini.
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

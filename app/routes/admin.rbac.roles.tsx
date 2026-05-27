import { Link, useLoaderData } from "react-router";
import { Eye, Plus } from "lucide-react";
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
import type { AdminRbacRole } from "~/modules/admin/presentation/utils/admin-dashboard.server";
import {
  fetchRbacRoles,
  getMockRbacRoles,
  requireAdminSession,
} from "~/modules/admin/presentation/utils/admin-dashboard.server";

type LoaderData = {
  roles: AdminRbacRole[];
};

export async function loader({ request }: { request: Request }) {
  await requireAdminSession(request);
  const liveRoles = await fetchRbacRoles(request);
  return { roles: liveRoles ?? getMockRbacRoles() };
}

export default function AdminRbacRolesRoute() {
  const { roles } = useLoaderData() as LoaderData;

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>RBAC Roles</CardTitle>
            <CardDescription>Kelola role granular dan lihat cakupan izin tiap role.</CardDescription>
          </div>
          <Button asChild size="sm">
            <Link to="/admin/rbac/roles/new">
              <Plus className="size-4" />
              Create Role
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Members</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <p className="font-medium">{role.name}</p>
                </TableCell>
                <TableCell className="max-w-[18rem]">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission) => (
                      <Badge key={permission} variant="outline">
                        {permission}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge variant="secondary">+{role.permissions.length - 3}</Badge>
                    )}
                    {role.permissions.length === 0 && (
                      <span className="text-muted-foreground text-xs">No permissions</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{role.memberCount}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/rbac/roles/${role.id}`}>
                      <Eye className="size-4" />
                      Detail
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                  Belum ada role.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

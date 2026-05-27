import { Link, useLoaderData } from "react-router";
import { Eye, MoreHorizontal } from "lucide-react";
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
import type { AdminManagedUser } from "~/modules/admin/presentation/utils/admin-dashboard.server";
import {
  fetchManagedUsers,
  formatDateTime,
  getMockUsers,
  requireAdminSession,
} from "~/modules/admin/presentation/utils/admin-dashboard.server";

type LoaderData = {
  users: AdminManagedUser[];
};

export async function loader({ request }: { request: Request }) {
  await requireAdminSession(request);
  const liveUsers = await fetchManagedUsers(request);
  return { users: liveUsers ?? getMockUsers() };
}

function statusBadgeVariant(status: AdminManagedUser["status"]) {
  if (status === "ACTIVE") return "ghost";
  if (status === "DISABLED") return "destructive";
  return "secondary";
}

export default function AdminUsersRoute() {
  const { users } = useLoaderData() as LoaderData;

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          Daftar akun user BidMart. Klik detail untuk melihat profil dan sesi aktif.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Active Sessions</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="max-w-[10rem]">
                  <p className="truncate font-medium">{user.name}</p>
                  <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(user.status)}>{user.status}</Badge>
                </TableCell>
                <TableCell className="max-w-[9rem]">
                  <p className="truncate text-xs">{user.roles.join(", ")}</p>
                </TableCell>
                <TableCell>{user.activeSessions}</TableCell>
                <TableCell>{user.lastSeenAt ? formatDateTime(user.lastSeenAt) : "-"}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/admin/users/${user.id}`}>
                      <Eye className="size-4" />
                      Detail
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                  Tidak ada data user.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
          <MoreHorizontal className="size-3" />
          Endpoint backend untuk pagination/filter akan dihubungkan pada iterasi berikutnya.
        </div>
      </CardContent>
    </Card>
  );
}

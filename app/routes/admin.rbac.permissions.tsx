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
import type { AdminRbacPermissionsPanel } from "~/modules/admin/presentation/utils/admin-dashboard.server";
import {
  assignRolePermissionForRbac,
  assignUserRoleForRbac,
  fetchRbacPermissionsPanel,
  getMockRbacPermissionsPanel,
  requireAdminSession,
  revokeRolePermissionForRbac,
  revokeUserRoleForRbac,
} from "~/modules/admin/presentation/utils/admin-dashboard.server";

type LoaderData = {
  panel: AdminRbacPermissionsPanel;
};

type ActionData = {
  success?: string;
  error?: string;
};

export async function loader({ request }: { request: Request }) {
  await requireAdminSession(request);
  const panel = (await fetchRbacPermissionsPanel(request)) ?? getMockRbacPermissionsPanel();
  return { panel };
}

export async function action({ request }: { request: Request }) {
  await requireAdminSession(request);
  const formData = await request.formData();

  const intent = String(formData.get("intent") ?? "");
  if (intent === "assign_user_role" || intent === "revoke_user_role") {
    const userId = String(formData.get("userId") ?? "").trim();
    const role = String(formData.get("role") ?? "").trim();
    if (!userId || !role) {
      return { error: "User dan role wajib dipilih." } satisfies ActionData;
    }

    const result =
      intent === "assign_user_role"
        ? await assignUserRoleForRbac(request, userId, { role })
        : await revokeUserRoleForRbac(request, userId, { role });

    if (!result.data) {
      return { error: result.message ?? "Gagal memperbarui role user." } satisfies ActionData;
    }
    return { success: result.data.message } satisfies ActionData;
  }

  if (intent === "assign_role_permission" || intent === "revoke_role_permission") {
    const role = String(formData.get("roleName") ?? "").trim();
    const permission = String(formData.get("permission") ?? "").trim();
    if (!role || !permission) {
      return { error: "Role dan permission wajib dipilih." } satisfies ActionData;
    }

    const result =
      intent === "assign_role_permission"
        ? await assignRolePermissionForRbac(request, role, { permission })
        : await revokeRolePermissionForRbac(request, role, { permission });

    if (!result.data) {
      return { error: result.message ?? "Gagal memperbarui permission role." } satisfies ActionData;
    }
    return { success: result.data.message } satisfies ActionData;
  }

  return { error: "Invalid action." } satisfies ActionData;
}

const selectClassName =
  "border-input bg-background focus-visible:border-primary focus-visible:ring-primary/20 h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]";

export default function AdminRbacPermissionsRoute() {
  const { panel } = useLoaderData() as LoaderData;
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="space-y-4">
      <Card className="gap-4">
        <CardHeader>
          <CardTitle>RBAC Permission Assignment</CardTitle>
          <CardDescription>Assign/revoke role untuk user dan permission untuk role.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {actionData?.success && <p className="text-sm text-emerald-600">{actionData.success}</p>}
          {actionData?.error && <p className="text-sm text-destructive">{actionData.error}</p>}

          <div className="grid gap-4 lg:grid-cols-2">
            <Form method="post" className="space-y-3 rounded-lg border p-3">
              <p className="text-sm font-medium">User Role Assignment</p>
              <select name="userId" className={selectClassName} required disabled={isSubmitting} defaultValue="">
                <option value="" disabled>
                  Pilih user
                </option>
                {panel.users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <select name="role" className={selectClassName} required disabled={isSubmitting} defaultValue="">
                <option value="" disabled>
                  Pilih role
                </option>
                {panel.roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  name="intent"
                  value="assign_user_role"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Assign Role"}
                </Button>
                <Button
                  type="submit"
                  name="intent"
                  value="revoke_user_role"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Revoke Role"}
                </Button>
              </div>
            </Form>

            <Form method="post" className="space-y-3 rounded-lg border p-3">
              <p className="text-sm font-medium">Role Permission Assignment</p>
              <select
                name="roleName"
                className={selectClassName}
                required
                disabled={isSubmitting}
                defaultValue=""
              >
                <option value="" disabled>
                  Pilih role
                </option>
                {panel.roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
              <select
                name="permission"
                className={selectClassName}
                required
                disabled={isSubmitting}
                defaultValue=""
              >
                <option value="" disabled>
                  Pilih permission
                </option>
                {panel.permissions.map((permission) => (
                  <option key={permission} value={permission}>
                    {permission}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  name="intent"
                  value="assign_role_permission"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Assign Permission"}
                </Button>
                <Button
                  type="submit"
                  name="intent"
                  value="revoke_role_permission"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Revoke Permission"}
                </Button>
              </div>
            </Form>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="gap-4">
          <CardHeader>
            <CardTitle>Users & Roles</CardTitle>
            <CardDescription>Snapshot role yang dimiliki tiap user.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Roles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {panel.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="max-w-[16rem]">
                      <p className="truncate font-medium">{user.name}</p>
                      <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="outline">
                            {role}
                          </Badge>
                        ))}
                        {user.roles.length === 0 && (
                          <span className="text-muted-foreground text-xs">No role</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="gap-4">
          <CardHeader>
            <CardTitle>Roles & Permissions</CardTitle>
            <CardDescription>Snapshot permission yang dimiliki tiap role.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {panel.roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((permission) => (
                          <Badge key={permission} variant="outline">
                            {permission}
                          </Badge>
                        ))}
                        {role.permissions.length === 0 && (
                          <span className="text-muted-foreground text-xs">No permissions</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

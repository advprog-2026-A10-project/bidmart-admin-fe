import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { Input } from "~/shared/components/ui/input";
import { Label } from "~/shared/components/ui/label";
import {
  createRbacRole,
  requireAdminSession,
} from "~/modules/admin/presentation/utils/admin-dashboard.server";

type ActionData = {
  error?: string;
};

export async function loader({ request }: { request: Request }) {
  await requireAdminSession(request);
  return null;
}

export async function action({ request }: { request: Request }) {
  await requireAdminSession(request);

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Role name wajib diisi." } satisfies ActionData;
  }

  const result = await createRbacRole(request, { name });
  if (!result.data) {
    return { error: result.message ?? "Gagal membuat role." } satisfies ActionData;
  }

  return redirect(`/admin/rbac/roles/${result.data.id}`);
}

export default function AdminRbacRoleNewRoute() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>Create Role</CardTitle>
            <CardDescription>Tambahkan role granular baru untuk kebutuhan otorisasi admin.</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/rbac/roles">
              <ArrowLeft className="size-4" />
              Back to Roles
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {actionData?.error && <p className="text-sm text-destructive">{actionData.error}</p>}

        <Form method="post" className="max-w-md space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Role Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Contoh: SUPPORT_AGENT"
              autoComplete="off"
              required
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            <Plus className="size-4" />
            {isSubmitting ? "Creating..." : "Create Role"}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}

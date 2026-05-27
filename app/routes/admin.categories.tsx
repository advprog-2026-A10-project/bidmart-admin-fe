import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { Trash2 } from "lucide-react";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { Input } from "~/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";
import type { AdminCategory } from "~/modules/admin/presentation/utils/admin-dashboard.server";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  formatDateTime,
  getMockCategories,
  requireAdminSession,
  updateCategory,
} from "~/modules/admin/presentation/utils/admin-dashboard.server";

type LoaderData = {
  categories: AdminCategory[];
};

type ActionData = {
  success?: string;
  error?: string;
};

type CategoryNode = AdminCategory & {
  depth: number;
  pathLabel: string;
  parentName: string | null;
};

export async function loader({ request }: { request: Request }) {
  await requireAdminSession(request);
  const live = await fetchCategories(request);
  return { categories: live ?? getMockCategories() };
}

function parseParentId(raw: FormDataEntryValue | null): number | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("Kategori parent tidak valid.");
  }
  return parsed;
}

export async function action({ request }: { request: Request }) {
  await requireAdminSession(request);
  const formData = await request.formData();

  const intent = String(formData.get("intent") ?? "").trim();

  if (intent === "create") {
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const imageUrl = String(formData.get("imageUrl") ?? "").trim();

    if (!name || !slug) {
      return { error: "Nama dan slug kategori wajib diisi." } satisfies ActionData;
    }

    let parentId: number | null = null;
    try {
      parentId = parseParentId(formData.get("parentId"));
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Kategori parent tidak valid.",
      } satisfies ActionData;
    }

    const result = await createCategory(request, {
      name,
      slug,
      parentId,
      imageUrl: imageUrl || null,
    });

    if (!result.data) {
      return { error: result.message ?? "Gagal menambah kategori." } satisfies ActionData;
    }

    return { success: `Kategori ${result.data.name} berhasil ditambahkan.` } satisfies ActionData;
  }

  if (intent === "update") {
    const categoryId = Number(formData.get("categoryId") ?? 0);
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const imageUrl = String(formData.get("imageUrl") ?? "").trim();

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return { error: "Kategori tidak valid." } satisfies ActionData;
    }
    if (!name || !slug) {
      return { error: "Nama dan slug kategori wajib diisi." } satisfies ActionData;
    }

    let parentId: number | null = null;
    try {
      parentId = parseParentId(formData.get("parentId"));
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Kategori parent tidak valid.",
      } satisfies ActionData;
    }

    const result = await updateCategory(request, categoryId, {
      name,
      slug,
      parentId,
      imageUrl: imageUrl || null,
    });

    if (!result.data) {
      return { error: result.message ?? "Gagal memperbarui kategori." } satisfies ActionData;
    }

    return { success: `Kategori ${result.data.name} berhasil diperbarui.` } satisfies ActionData;
  }

  if (intent === "delete") {
    const categoryId = Number(formData.get("categoryId") ?? 0);
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return { error: "Kategori tidak valid." } satisfies ActionData;
    }

    const result = await deleteCategory(request, categoryId);
    if (result.status !== 204) {
      return { error: result.message ?? "Gagal menghapus kategori." } satisfies ActionData;
    }

    return { success: "Kategori berhasil dihapus." } satisfies ActionData;
  }

  return { error: "Invalid action." } satisfies ActionData;
}

function toHierarchy(categories: AdminCategory[]): CategoryNode[] {
  const byParent = new Map<number | null, AdminCategory[]>();
  const byId = new Map<number, AdminCategory>();

  for (const category of categories) {
    byId.set(category.id, category);
    const key = category.parentId;
    const bucket = byParent.get(key) ?? [];
    bucket.push(category);
    byParent.set(key, bucket);
  }

  for (const bucket of byParent.values()) {
    bucket.sort((a, b) => a.name.localeCompare(b.name));
  }

  const result: CategoryNode[] = [];
  const visited = new Set<number>();

  const walk = (parentId: number | null, depth: number, lineage: string[]) => {
    const children = byParent.get(parentId) ?? [];
    for (const child of children) {
      if (visited.has(child.id)) continue;
      visited.add(child.id);

      const path = [...lineage, child.name];
      const parentName = child.parentId ? byId.get(child.parentId)?.name ?? null : null;

      result.push({
        ...child,
        depth,
        pathLabel: path.join(" > "),
        parentName,
      });

      walk(child.id, depth + 1, path);
    }
  };

  walk(null, 0, []);

  // Orphan safeguard for broken parent references.
  const remaining = categories
    .filter((category) => !visited.has(category.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const category of remaining) {
    const parentName = category.parentId ? byId.get(category.parentId)?.name ?? null : null;
    result.push({
      ...category,
      depth: 0,
      pathLabel: category.name,
      parentName,
    });
  }

  return result;
}

export default function AdminCategoriesRoute() {
  const { categories } = useLoaderData() as LoaderData;
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const hierarchy = toHierarchy(categories);

  return (
    <div className="space-y-4">
      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Item Categories</CardTitle>
          <CardDescription>
            Kelola kategori bertingkat untuk katalog BidMart, contoh: Elektronik &gt; Handphone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {actionData?.success && <p className="text-sm text-emerald-600">{actionData.success}</p>}
          {actionData?.error && <p className="text-sm text-destructive">{actionData.error}</p>}

          <Form method="post" className="grid gap-3 rounded-lg border p-3 md:grid-cols-2 xl:grid-cols-5">
            <Input name="name" placeholder="Category name" required disabled={isSubmitting} />
            <Input
              name="slug"
              placeholder="category-slug"
              required
              disabled={isSubmitting}
              pattern="[a-z0-9-]+"
            />
            <select
              name="parentId"
              className="border-input bg-background focus-visible:border-primary focus-visible:ring-primary/20 h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
              defaultValue=""
              disabled={isSubmitting}
            >
              <option value="">Root category</option>
              {hierarchy.map((category) => (
                <option key={category.id} value={category.id}>
                  {`${"-".repeat(category.depth)} ${category.name}`.trim()}
                </option>
              ))}
            </select>
            <Input
              name="imageUrl"
              placeholder="Image URL (optional)"
              disabled={isSubmitting}
            />
            <Button name="intent" value="create" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Category"}
            </Button>
          </Form>
        </CardContent>
      </Card>

      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Category Tree</CardTitle>
          <CardDescription>
            Update kategori, ubah parent untuk memindahkan hierarchy, atau hapus leaf category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Children</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hierarchy.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="min-w-[16rem] align-top">
                    <p className="font-medium">{category.name}</p>
                    <p className="text-muted-foreground text-xs">{category.pathLabel}</p>
                  </TableCell>
                  <TableCell className="min-w-[12rem] align-top">{category.slug}</TableCell>
                  <TableCell className="min-w-[12rem] align-top">{category.parentName ?? "(root)"}</TableCell>
                  <TableCell className="align-top">{category.childCount}</TableCell>
                  <TableCell className="align-top">{formatDateTime(category.updatedAt)}</TableCell>
                  <TableCell className="min-w-[22rem] align-top text-right">
                    <Form method="post" className="space-y-2">
                      <input type="hidden" name="categoryId" value={category.id} />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input
                          name="name"
                          defaultValue={category.name}
                          placeholder="Category name"
                          required
                          disabled={isSubmitting}
                        />
                        <Input
                          name="slug"
                          defaultValue={category.slug}
                          placeholder="category-slug"
                          required
                          pattern="[a-z0-9-]+"
                          disabled={isSubmitting}
                        />
                      </div>
                      <select
                        name="parentId"
                        className="border-input bg-background focus-visible:border-primary focus-visible:ring-primary/20 h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
                        defaultValue={category.parentId?.toString() ?? ""}
                        disabled={isSubmitting}
                      >
                        <option value="">Root category</option>
                        {hierarchy
                          .filter((candidate) => candidate.id !== category.id)
                          .map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>
                              {`${"-".repeat(candidate.depth)} ${candidate.name}`.trim()}
                            </option>
                          ))}
                      </select>
                      <Input
                        name="imageUrl"
                        defaultValue={category.imageUrl ?? ""}
                        placeholder="Image URL"
                        disabled={isSubmitting}
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button name="intent" value="update" size="sm" disabled={isSubmitting}>
                          Save
                        </Button>
                        <Button
                          name="intent"
                          value="delete"
                          size="sm"
                          variant="outline"
                          formNoValidate
                          disabled={isSubmitting || category.childCount > 0}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      </div>
                    </Form>
                  </TableCell>
                </TableRow>
              ))}
              {hierarchy.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                    Belum ada kategori.
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

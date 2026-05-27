import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";
import { ArrowLeft, CircleCheck } from "lucide-react";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import type { AdminDispute } from "~/modules/admin/presentation/utils/admin-dashboard.server";
import {
  fetchDisputeById,
  formatCurrency,
  formatDateTime,
  getMockDisputeById,
  resolveDisputeById,
  requireAdminSession,
} from "~/modules/admin/presentation/utils/admin-dashboard.server";
import { Textarea } from "~/shared/components/ui/textarea";

type LoaderData = {
  dispute: AdminDispute;
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
  params: { disputeId?: string };
}) {
  await requireAdminSession(request);
  const disputeId = params.disputeId ?? "";
  const dispute = (await fetchDisputeById(request, disputeId)) ?? getMockDisputeById(disputeId);
  if (!dispute) throw new Response("Dispute not found", { status: 404 });
  return { dispute };
}

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { disputeId?: string };
}) {
  await requireAdminSession(request);

  const disputeId = params.disputeId ?? "";
  if (!disputeId) {
    return { error: "Invalid dispute id." } satisfies ActionData;
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");
  const resolution = String(formData.get("resolution") ?? "").trim();

  let outcome: "BUYER" | "SELLER" | null = null;
  if (intent === "resolve_buyer") outcome = "BUYER";
  if (intent === "resolve_seller") outcome = "SELLER";

  if (!outcome) {
    return { error: "Invalid action." } satisfies ActionData;
  }
  if (!resolution) {
    return { error: "Resolution wajib diisi." } satisfies ActionData;
  }

  const result = await resolveDisputeById(request, disputeId, { outcome, resolution });
  if (!result.data) {
    return { error: result.message ?? "Gagal menyelesaikan sengketa." } satisfies ActionData;
  }

  return {
    success: `Sengketa berhasil diselesaikan untuk ${outcome === "BUYER" ? "buyer" : "seller"}.`,
  } satisfies ActionData;
}

function statusBadgeVariant(status: string) {
  if (status === "OPEN") return "secondary";
  if (status === "UNDER_REVIEW") return "outline";
  if (status === "RESOLVED_BUYER" || status === "RESOLVED_SELLER") return "ghost";
  return "outline";
}

function formatReason(reason: string) {
  if (reason === "ITEM_NOT_AS_DESCRIBED") return "Item Not As Described";
  if (reason === "ITEM_NOT_RECEIVED") return "Item Not Received";
  return "Other";
}

function formatOpenedByParty(openedByParty: AdminDispute["openedByParty"]) {
  if (openedByParty === "BUYER") return "Buyer";
  if (openedByParty === "SELLER") return "Seller";
  return "Unknown";
}

export default function AdminDisputeDetailRoute() {
  const { dispute } = useLoaderData() as LoaderData;
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const canResolve = dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button asChild size="sm" variant="outline">
          <Link to="/admin/disputes">
            <ArrowLeft className="size-4" />
            Back to Disputes
          </Link>
        </Button>
        <Badge variant={statusBadgeVariant(dispute.status)}>{dispute.status}</Badge>
      </div>

      <Card className="gap-4">
        <CardHeader>
          <CardTitle>{formatReason(dispute.reason)}</CardTitle>
          <CardDescription>Dispute ID: {dispute.id}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Order ID</p>
            <p className="text-sm break-all">{dispute.orderId}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Opened By</p>
            <p className="text-sm">{formatOpenedByParty(dispute.openedByParty)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Opened At</p>
            <p className="text-sm">{formatDateTime(dispute.createdAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Resolved At</p>
            <p className="text-sm">{dispute.resolvedAt ? formatDateTime(dispute.resolvedAt) : "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Final Price</p>
            <p className="text-sm">{formatCurrency(dispute.finalPrice)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Order Status</p>
            <p className="text-sm">{dispute.orderStatus}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Order Context</CardTitle>
          <CardDescription>Ringkasan buyer, seller, dan item terkait sengketa.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <div className="overflow-hidden rounded-lg border">
            {dispute.orderImageUrl ? (
              <img
                src={dispute.orderImageUrl}
                alt={dispute.orderTitle}
                className="h-full min-h-[180px] w-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground flex min-h-[180px] items-center justify-center text-sm">
                No Image
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <p className="text-muted-foreground text-xs">Order Item</p>
              <p className="text-sm font-medium">{dispute.orderTitle}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Buyer</p>
              <p className="text-sm">{dispute.buyerName}</p>
              <p className="text-muted-foreground text-xs break-all">{dispute.buyerId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Seller</p>
              <p className="text-sm">{dispute.sellerName}</p>
              <p className="text-muted-foreground text-xs break-all">{dispute.sellerId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Dispute Notes</CardTitle>
          <CardDescription>Deskripsi laporan dan hasil penyelesaian sengketa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Reported Description</p>
            <p className="rounded-md border p-3 text-sm leading-relaxed">{dispute.description}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Resolution</p>
            <p className="rounded-md border p-3 text-sm leading-relaxed">
              {dispute.resolution ?? "Belum ada resolusi untuk sengketa ini."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-3">
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>
            Tentukan keputusan akhir sengketa lalu pilih hasil untuk buyer atau seller.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {actionData?.success && <p className="text-sm text-emerald-600">{actionData.success}</p>}
          {actionData?.error && <p className="text-sm text-destructive">{actionData.error}</p>}
          {!canResolve && (
            <p className="text-muted-foreground text-sm">
              Sengketa ini sudah final dan tidak bisa di-resolve ulang.
            </p>
          )}

          <Form method="post" className="space-y-3">
            <Textarea
              name="resolution"
              placeholder="Tulis keputusan admin untuk penyelesaian sengketa ini..."
              defaultValue={dispute.resolution ?? ""}
              disabled={!canResolve || isSubmitting}
              required
              minLength={5}
              rows={4}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                name="intent"
                value="resolve_buyer"
                disabled={!canResolve || isSubmitting}
              >
                <CircleCheck className="size-4" />
                {isSubmitting ? "Processing..." : "Resolve for Buyer"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                name="intent"
                value="resolve_seller"
                disabled={!canResolve || isSubmitting}
              >
                <CircleCheck className="size-4" />
                {isSubmitting ? "Processing..." : "Resolve for Seller"}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

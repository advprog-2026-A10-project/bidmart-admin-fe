import { Link, useLoaderData } from "react-router";
import { ArrowLeft, Ban, CircleCheck, EyeOff } from "lucide-react";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import type { AdminListingModeration } from "~/modules/admin/presentation/utils/admin-dashboard.server";
import {
  fetchModerationListingById,
  formatCurrency,
  formatDateTime,
  getMockListingById,
  requireAdminSession,
} from "~/modules/admin/presentation/utils/admin-dashboard.server";

type LoaderData = {
  listing: AdminListingModeration;
};

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { listingId?: string };
}) {
  await requireAdminSession(request);
  const listingId = params.listingId ?? "";
  const listing = (await fetchModerationListingById(request, listingId)) ?? getMockListingById(listingId);
  if (!listing) throw new Response("Listing not found", { status: 404 });
  return { listing };
}

function statusBadgeVariant(status: AdminListingModeration["status"]) {
  if (status === "ACTIVE") return "ghost";
  if (status === "FLAGGED") return "secondary";
  if (status === "REJECTED") return "destructive";
  return "outline";
}

export default function AdminModerationListingDetailRoute() {
  const { listing } = useLoaderData() as LoaderData;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button asChild size="sm" variant="outline">
          <Link to="/admin/moderation/listings">
            <ArrowLeft className="size-4" />
            Back to Listings
          </Link>
        </Button>
        <Badge variant={statusBadgeVariant(listing.status)}>{listing.status}</Badge>
      </div>

      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="leading-snug">{listing.title}</CardTitle>
          <CardDescription>Listing ID: {listing.id}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className="overflow-hidden rounded-lg border">
            <img src={listing.thumbnailUrl} alt={listing.title} className="h-full w-full object-cover" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Category</p>
              <p className="text-sm">{listing.categoryPath}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Seller</p>
              <p className="text-sm">
                {listing.sellerName} ({listing.sellerId})
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Starting Price</p>
              <p className="text-sm">{formatCurrency(listing.startingPrice)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Reserve Price</p>
              <p className="text-sm">
                {listing.reservePrice ? formatCurrency(listing.reservePrice) : "-"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Current Bid</p>
              <p className="text-sm">{listing.currentBid ? formatCurrency(listing.currentBid) : "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Bid Count</p>
              <p className="text-sm">{listing.bidCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Created At</p>
              <p className="text-sm">{formatDateTime(listing.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Auction End</p>
              <p className="text-sm">{listing.endAt ? formatDateTime(listing.endAt) : "-"}</p>
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="text-muted-foreground mb-1 text-xs">Description</p>
            <p className="rounded-md border p-3 text-sm leading-relaxed">{listing.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-3">
        <CardHeader>
          <CardTitle>Moderation Actions</CardTitle>
          <CardDescription>
            Aksi approve/reject/hide akan disambungkan ke endpoint admin-be pada iterasi berikutnya.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled>
            <CircleCheck className="size-4" />
            Approve Listing
          </Button>
          <Button variant="outline" size="sm" disabled>
            <EyeOff className="size-4" />
            Hide Listing
          </Button>
          <Button variant="destructive" size="sm" disabled>
            <Ban className="size-4" />
            Reject Listing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

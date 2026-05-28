import { Link, useLoaderData } from "react-router";
import { Eye } from "lucide-react";
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
import type { AdminListingModeration } from "~/modules/admin/presentation/utils/admin-dashboard.server";
import {
  fetchModerationListings,
  formatCurrency,
  formatDateTime,
  getMockListings,
  requireAdminSession,
} from "~/modules/admin/presentation/utils/admin-dashboard.server";

type LoaderData = {
  listings: AdminListingModeration[];
};

export async function loader({ request }: { request: Request }) {
  await requireAdminSession(request);
  const liveListings = await fetchModerationListings(request);
  return { listings: liveListings ?? getMockListings() };
}

function statusBadgeVariant(status: AdminListingModeration["status"]) {
  if (status === "ACTIVE") return "ghost";
  if (status === "FLAGGED") return "secondary";
  if (status === "REJECTED") return "destructive";
  return "outline";
}

export default function AdminModerationListingsRoute() {
  const { listings } = useLoaderData() as LoaderData;

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>Listing Moderation</CardTitle>
        <CardDescription>
          Daftar seluruh listing untuk review admin sebelum/selama pelelangan berjalan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Listing</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current Bid</TableHead>
              <TableHead>Bids</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell className="max-w-[13rem]">
                  <p className="truncate font-medium">{listing.title}</p>
                  <p className="text-muted-foreground truncate text-xs">{listing.categoryPath}</p>
                </TableCell>
                <TableCell className="max-w-[9rem]">
                  <p className="truncate text-sm">{listing.sellerName}</p>
                  <p className="text-muted-foreground truncate text-xs">{listing.sellerId}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(listing.status)}>{listing.status}</Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {listing.currentBid ? formatCurrency(listing.currentBid) : "-"}
                </TableCell>
                <TableCell>{listing.bidCount}</TableCell>
                <TableCell>{formatDateTime(listing.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/admin/moderation/listings/${listing.id}`}>
                      <Eye className="size-4" />
                      Detail
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {listings.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                  Tidak ada listing.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

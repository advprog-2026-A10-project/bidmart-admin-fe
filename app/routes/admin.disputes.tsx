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
import type { AdminDispute } from "~/modules/admin/presentation/utils/admin-dashboard.server";
import {
  fetchDisputes,
  formatDateTime,
  getMockDisputes,
  requireAdminSession,
} from "~/modules/admin/presentation/utils/admin-dashboard.server";

type LoaderData = {
  disputes: AdminDispute[];
};

export async function loader({ request }: { request: Request }) {
  await requireAdminSession(request);
  const liveDisputes = await fetchDisputes(request);
  return { disputes: liveDisputes ?? getMockDisputes() };
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

export default function AdminDisputesRoute() {
  const { disputes } = useLoaderData() as LoaderData;

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>Disputes</CardTitle>
        <CardDescription>
          Daftar order yang sedang atau pernah disengketakan untuk ditinjau admin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dispute</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Parties</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.map((dispute) => (
              <TableRow key={dispute.id}>
                <TableCell className="max-w-[14rem]">
                  <p className="truncate text-sm font-medium">{formatReason(dispute.reason)}</p>
                  <p className="text-muted-foreground truncate text-xs">ID: {dispute.id}</p>
                </TableCell>
                <TableCell className="max-w-[15rem]">
                  <p className="truncate text-sm">{dispute.orderTitle}</p>
                  <p className="text-muted-foreground truncate text-xs">Order: {dispute.orderId}</p>
                </TableCell>
                <TableCell className="max-w-[14rem]">
                  <p className="truncate text-xs">Buyer: {dispute.buyerName}</p>
                  <p className="text-muted-foreground truncate text-xs">Seller: {dispute.sellerName}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(dispute.status)}>{dispute.status}</Badge>
                </TableCell>
                <TableCell>{formatDateTime(dispute.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/admin/disputes/${dispute.id}`}>
                      <Eye className="size-4" />
                      Detail
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {disputes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                  Tidak ada data sengketa.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

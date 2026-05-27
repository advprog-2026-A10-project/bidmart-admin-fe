import { useEffect } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import { Activity, Gavel, Radio, ShieldAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { Badge } from "~/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";
import type { AdminSystemActivitySnapshot } from "~/modules/admin/presentation/utils/admin-dashboard.server";
import {
  fetchSystemActivitySnapshot,
  formatDateTime,
  getMockSystemActivitySnapshot,
  requireAdminSession,
} from "~/modules/admin/presentation/utils/admin-dashboard.server";

type LoaderData = {
  snapshot: AdminSystemActivitySnapshot;
};

export async function loader({ request }: { request: Request }) {
  await requireAdminSession(request);
  const live = await fetchSystemActivitySnapshot(request);
  return { snapshot: live ?? getMockSystemActivitySnapshot() };
}

function eventBadgeVariant(kind: string) {
  if (kind === "BID") return "secondary";
  if (kind === "DISPUTE") return "destructive";
  return "outline";
}

export default function AdminSystemActivityRoute() {
  const { snapshot } = useLoaderData() as LoaderData;
  const revalidator = useRevalidator();

  useEffect(() => {
    const interval = window.setInterval(() => {
      revalidator.revalidate();
    }, 7000);
    return () => window.clearInterval(interval);
  }, [revalidator]);

  return (
    <div className="space-y-4">
      <Card className="gap-4">
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
          <CardDescription>
            Monitoring aktivitas lelang, publikasi event, dan statistik operasional (auto-refresh 7 detik).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="gap-2">
            <CardHeader className="pb-0">
              <CardDescription>Active Auctions</CardDescription>
              <CardTitle>{snapshot.kpi.activeAuctions}</CardTitle>
            </CardHeader>
            <CardContent>
              <Gavel className="text-muted-foreground size-4" />
            </CardContent>
          </Card>
          <Card className="gap-2">
            <CardHeader className="pb-0">
              <CardDescription>Bids (24h)</CardDescription>
              <CardTitle>{snapshot.kpi.bidsLast24h}</CardTitle>
            </CardHeader>
            <CardContent>
              <Activity className="text-muted-foreground size-4" />
            </CardContent>
          </Card>
          <Card className="gap-2">
            <CardHeader className="pb-0">
              <CardDescription>Open Disputes</CardDescription>
              <CardTitle>{snapshot.kpi.openDisputes}</CardTitle>
            </CardHeader>
            <CardContent>
              <ShieldAlert className="text-muted-foreground size-4" />
            </CardContent>
          </Card>
          <Card className="gap-2">
            <CardHeader className="pb-0">
              <CardDescription>Published Events (24h)</CardDescription>
              <CardTitle>{snapshot.kpi.publishedEventsLast24h}</CardTitle>
            </CardHeader>
            <CardContent>
              <Radio className="text-muted-foreground size-4" />
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Recent Activity Feed</CardTitle>
          <CardDescription>Updated at {formatDateTime(snapshot.generatedAt)}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshot.recentEvents.map((event, index) => (
                <TableRow key={`${event.occurredAt}-${index}`}>
                  <TableCell>
                    <Badge variant={eventBadgeVariant(event.kind)}>{event.kind}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[15rem] truncate font-medium">{event.title}</TableCell>
                  <TableCell className="max-w-[25rem] truncate">{event.detail}</TableCell>
                  <TableCell>{formatDateTime(event.occurredAt)}</TableCell>
                </TableRow>
              ))}
              {snapshot.recentEvents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                    Belum ada event aktivitas terbaru.
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

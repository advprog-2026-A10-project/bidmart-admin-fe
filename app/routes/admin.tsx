import { Outlet, NavLink, useLoaderData, useLocation, useNavigate } from "react-router";
import {
  Shield,
  Users,
  LogOut,
  UserRoundSearch,
  Gavel,
  Scale,
  KeyRound,
  SlidersHorizontal,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { useLogoutMutation } from "~/modules/auth/presentation/hooks/use-logout-mutation";
import { Avatar, AvatarFallback } from "~/shared/components/ui/avatar";
import { Button } from "~/shared/components/ui/button";
import { Separator } from "~/shared/components/ui/separator";
import { ScrollArea } from "~/shared/components/ui/scroll-area";
import type { AdminSession } from "~/modules/admin/presentation/utils/admin-dashboard.server";
import { requireAdminSession } from "~/modules/admin/presentation/utils/admin-dashboard.server";

const navItems = [
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/moderation/listings", label: "Listing Moderation", icon: Gavel },
  { to: "/admin/disputes", label: "Disputes", icon: Scale },
  { to: "/admin/rbac/roles", label: "Roles", icon: KeyRound },
  { to: "/admin/rbac/permissions", label: "Permissions", icon: SlidersHorizontal },
  { to: "/admin/system/activity", label: "System Activity", icon: Activity },
  { to: "/admin/system/security", label: "System Security", icon: ShieldCheck },
];

export async function loader({ request }: { request: Request }) {
  const admin = await requireAdminSession(request);
  return { admin };
}

export default function AdminLayoutRoute() {
  const { admin } = useLoaderData() as { admin: AdminSession };
  const logout = useLogoutMutation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  let panelLabel = "Admin Panel / User Management";
  if (pathname.startsWith("/admin/moderation")) {
    panelLabel = "Admin Panel / Listing Moderation";
  } else if (pathname.startsWith("/admin/disputes")) {
    panelLabel = "Admin Panel / Dispute Management";
  } else if (pathname.startsWith("/admin/rbac/roles")) {
    panelLabel = "Admin Panel / RBAC Roles";
  } else if (pathname.startsWith("/admin/rbac/permissions")) {
    panelLabel = "Admin Panel / RBAC Permissions";
  } else if (pathname.startsWith("/admin/system/activity")) {
    panelLabel = "Admin Panel / System Activity";
  } else if (pathname.startsWith("/admin/system/security")) {
    panelLabel = "Admin Panel / System Security";
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--secondary)/0.35),transparent_22rem)] p-4 sm:p-6">
      <div className="grid min-h-[85vh] grid-cols-1 overflow-hidden rounded-xl border bg-background md:grid-cols-[220px_1fr]">
        <aside className="bg-muted/35">
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="bg-primary/10 text-primary rounded-md p-2">
              <Shield className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">BidMart Admin</p>
              <p className="text-muted-foreground text-xs">Control Center</p>
            </div>
          </div>

          <Separator />

          <ScrollArea className="h-[calc(100%-10.75rem)]">
            <nav className="space-y-1 p-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                    ].join(" ")
                  }
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </ScrollArea>

          <Separator />

          <div className="space-y-3 px-3 py-4">
            <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-2">
              <Avatar size="sm">
                <AvatarFallback>{admin.name.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{admin.name}</p>
                <p className="text-muted-foreground truncate text-xs">{admin.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              disabled={logout.isPending}
              onClick={() =>
                logout.mutate(undefined, {
                  onSettled: () => navigate("/login"),
                })
              }
            >
              <LogOut className="size-4" />
              {logout.isPending ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </aside>

        <section className="min-w-0 bg-background">
          <header className="flex items-center gap-2 border-b px-4 py-3">
            <UserRoundSearch className="text-muted-foreground size-4" />
            <p className="text-muted-foreground text-sm">{panelLabel}</p>
          </header>
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
}

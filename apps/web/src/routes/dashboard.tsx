import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/user-menu";
import { ModeToggle } from "@/components/mode-toggle";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  beforeLoad: async ({ context }) => {
    const session = await context.authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }

    // Check if user has a restaurant
    const orgStatus = await context.eden.api.restaurant.auth.status.get({
      fetch: { credentials: "include" },
    });

    return { session, orgStatus: orgStatus.data };
  },
});

const navLinks = [
  { to: "/dashboard" as const, label: "Overview", exact: true },
  { to: "/dashboard/orders" as const, label: "Orders" },
  { to: "/dashboard/menu" as const, label: "Menu" },
  { to: "/dashboard/tables" as const, label: "Tables" },
];

function DashboardLayout() {
  const { session, orgStatus } = Route.useRouteContext();
  const user = session.data?.user;

  // If user doesn't have an organization, show registration prompt
  if (!orgStatus?.hasOrganization) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground mb-6">
          You don't have a restaurant registered yet. Register your restaurant to get started.
        </p>
        <Link to="/dashboard/register">
          <Button size="lg">Register Restaurant</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Dashboard Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-lg font-bold">
              {orgStatus.organization?.name || "Dashboard"}
            </Link>
            <nav className="hidden md:flex gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                  activeProps={{ className: "bg-accent" }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden border-b overflow-x-auto">
        <div className="flex px-4 gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="px-3 py-2 text-sm font-medium whitespace-nowrap hover:bg-accent"
              activeProps={{ className: "bg-accent" }}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Page content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const { eden } = Route.useRouteContext();
  const { orgStatus } = Route.useRouteContext();
  const orgId = orgStatus?.organization?.id;

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", orgId],
    queryFn: () =>
      eden.api.restaurant[orgId!].profile.stats.get({
        fetch: { credentials: "include" },
      }),
    enabled: !!orgId,
  });

  const statsData = stats?.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tables</CardDescription>
            <CardTitle className="text-3xl">
              {statsData?.tables?.occupied ?? 0}/{statsData?.tables?.total ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Occupied / Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Menu Items</CardDescription>
            <CardTitle className="text-3xl">{statsData?.menu?.totalItems ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Available items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Orders</CardDescription>
            <CardTitle className="text-3xl">{statsData?.orders?.today ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {statsData?.orders?.pending ?? 0} pending, {statsData?.orders?.preparing ?? 0}{" "}
              preparing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-3xl">{statsData?.orders?.total ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

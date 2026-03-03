import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { SectionCards } from "@/components/admin/sidebar/section-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { eden } = Route.useRouteContext();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const result = await eden.api.admin.stats.get({
        fetch: { credentials: "include" },
      });
      if (result.error) throw new Error(String(result.error));
      return result.data;
    },
  });

  const { data: pendingOrgs } = useQuery({
    queryKey: ["admin-pending-orgs"],
    queryFn: async () => {
      const result = await eden.api.admin.organizations.pending.get({
        fetch: { credentials: "include" },
      });
      if (result.error) throw new Error(String(result.error));
      return result.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (orgId: string) => {
      const result = await eden.api.admin.organizations[orgId].approve.post(
        {},
        { fetch: { credentials: "include" } },
      );
      if (result.error) throw new Error(String(result.error));
      return result.data;
    },
    onSuccess: () => {
      toast.success("Organization approved");
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-orgs"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (orgId: string) => {
      const result = await eden.api.admin.organizations[orgId].reject.post(
        { reason: "Does not meet platform requirements" },
        { fetch: { credentials: "include" } },
      );
      if (result.error) throw new Error(String(result.error));
      return result.data;
    },
    onSuccess: () => {
      toast.success("Organization rejected");
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-orgs"] });
    },
  });

  const pending = (pendingOrgs as any[]) ?? [];

  return (
    <>
      <SectionCards stats={stats as any} />
      <div className="px-4 lg:px-6">
        <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
        {pending.length === 0 ? (
          <p className="text-muted-foreground">No pending organizations to review.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pending.map((org: any) => (
              <Card key={org.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    <Badge>PENDING</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Owner:</span> {org.owner?.name} (
                      {org.owner?.email})
                    </p>
                    {org.city && (
                      <p>
                        <span className="text-muted-foreground">Location:</span> {org.city},{" "}
                        {org.country}
                      </p>
                    )}
                    <p>
                      <span className="text-muted-foreground">Applied:</span>{" "}
                      {new Date(org.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(org.id)}
                      disabled={approveMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(org.id)}
                      disabled={rejectMutation.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

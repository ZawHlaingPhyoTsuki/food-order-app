import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/dashboard/tables")({
  component: TablesPage,
});

const statusColors: Record<string, string> = {
  FREE: "bg-green-500",
  OCCUPIED: "bg-yellow-500",
  NEEDS_CLEANING: "bg-red-500",
};

function TablesPage() {
  const { eden, orgStatus } = Route.useRouteContext();
  const orgId = orgStatus?.organization?.id;
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");

  const { data: tablesData, isLoading } = useQuery({
    queryKey: ["tables", orgId],
    queryFn: () =>
      eden.api.restaurant[orgId!].tables.get({
        fetch: { credentials: "include" },
      }),
    enabled: !!orgId,
  });

  const createTableMutation = useMutation({
    mutationFn: async (tableNumber: string) => {
      return eden.api.restaurant[orgId!].tables.post(
        { tableNumber },
        { fetch: { credentials: "include" } },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setShowAdd(false);
      setNewTableNumber("");
      toast.success("Table created");
    },
    onError: () => toast.error("Failed to create table"),
  });

  const clearTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      return eden.api.restaurant[orgId!].tables[tableId].clear.post(undefined as any, {
        fetch: { credentials: "include" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Table cleared");
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      return eden.api.restaurant[orgId!].tables[tableId].delete({
        fetch: { credentials: "include" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Table deleted");
    },
  });

  const tables = (tablesData?.data as any[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tables</h1>
        <Button onClick={() => setShowAdd(true)}>Add Table</Button>
      </div>

      {showAdd && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Table Number</Label>
                <Input
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder="e.g., 1, A1, VIP-1"
                />
              </div>
              <Button
                onClick={() => createTableMutation.mutate(newTableNumber)}
                disabled={!newTableNumber || createTableMutation.isPending}
              >
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Loading tables...</p>
      ) : tables.length === 0 ? (
        <p className="text-muted-foreground">No tables yet. Create your first table.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((table: any) => (
            <Card key={table.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Table {table.tableNumber}</CardTitle>
                  <Badge className={statusColors[table.status] || ""}>{table.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {table.qrUrl && (
                    <div className="text-xs text-muted-foreground break-all">
                      QR URL: {table.qrUrl}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {table.status !== "FREE" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => clearTableMutation.mutate(table.id)}
                      >
                        Clear Table
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`Delete table ${table.tableNumber}? This cannot be undone.`)) {
                          deleteTableMutation.mutate(table.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

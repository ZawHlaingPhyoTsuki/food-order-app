import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/orders")({
  component: OrdersPage,
});

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500",
  PREPARING: "bg-blue-500",
  READY: "bg-green-500",
  SERVED: "bg-gray-500",
  PAID: "bg-emerald-600",
  CANCELLED: "bg-red-500",
};

function OrdersPage() {
  const { eden, orgStatus } = Route.useRouteContext();
  const orgId = orgStatus?.organization?.id;
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["restaurant-orders", orgId, statusFilter],
    queryFn: () =>
      eden.api.restaurant[orgId!].orders.get({
        query: {
          ...(statusFilter !== "all" && { status: statusFilter as any }),
          limit: 50,
        },
        fetch: { credentials: "include" },
      }),
    enabled: !!orgId,
    refetchInterval: 10000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return eden.api.restaurant[orgId!].orders[orderId].status.patch(
        {
          status: status as any,
        },
        {
          fetch: { credentials: "include" },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-orders"] });
      toast.success("Order status updated");
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });

  const orders = ordersData?.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PREPARING">Preparing</SelectItem>
            <SelectItem value="READY">Ready</SelectItem>
            <SelectItem value="SERVED">Served</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">No orders found.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order: any) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Order #{order.orderNumber} - Table {order.table?.tableNumber}
                  </CardTitle>
                  <Badge className={statusColors[order.status] || ""}>{order.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.menuItem?.name} x{item.quantity}
                        {item.specialRequest && (
                          <span className="text-muted-foreground ml-2">
                            ({item.specialRequest})
                          </span>
                        )}
                      </span>
                      <span>{item.totalPrice} THB</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span>{order.total} THB</span>
                  </div>
                  {order.notes && (
                    <p className="text-sm text-muted-foreground">Note: {order.notes}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    {order.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            orderId: order.id,
                            status: "PREPARING",
                          })
                        }
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === "PREPARING" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            orderId: order.id,
                            status: "READY",
                          })
                        }
                      >
                        Mark Ready
                      </Button>
                    )}
                    {order.status === "READY" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            orderId: order.id,
                            status: "SERVED",
                          })
                        }
                      >
                        Mark Served
                      </Button>
                    )}
                    {!["PAID", "CANCELLED"].includes(order.status) && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            orderId: order.id,
                            status: "CANCELLED",
                          })
                        }
                      >
                        Cancel
                      </Button>
                    )}
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

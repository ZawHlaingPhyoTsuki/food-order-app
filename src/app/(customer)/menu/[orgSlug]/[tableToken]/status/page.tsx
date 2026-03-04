"use client";

import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    CheckCircle2,
    ChefHat,
    Clock,
    Eye,
    Utensils,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { API_ROUTES, api } from "@/lib/api-routes-flat";

export default function OrderStatusPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const { orgSlug, tableToken } = params as {
        orgSlug: string;
        tableToken: string;
    };
    const { session } = useCart();

    const orderId = searchParams.get("orderId");

    // Fetch order status (poll every 5 seconds)
    const { data: order, isLoading } = useQuery({
        queryKey: ["order-status", orderId],
        queryFn: () => {
            if (!orderId || !session) throw new Error("Missing data");
            return api.get(
                API_ROUTES.CUSTOMER_ORDER_STATUS(orderId) +
                    `?sessionId=${session.sessionId}`,
            );
        },
        enabled: !!orderId && !!session,
        refetchInterval: 5000, // Poll every 5 seconds
    });

    if (isLoading) {
        return <OrderStatusSkeleton />;
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
                <p className="text-gray-600 mb-6">
                    We couldn't find this order.
                </p>
                <Button
                    onClick={() =>
                        router.push(`/menu/${orgSlug}/${tableToken}`)
                    }
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Menu
                </Button>
            </div>
        );
    }

    const statusConfig = {
        PENDING: {
            icon: Clock,
            label: "Order Received",
            color: "bg-yellow-100 text-yellow-800 border-yellow-300",
            description:
                "Your order has been received and will be prepared shortly",
        },
        PREPARING: {
            icon: ChefHat,
            label: "Preparing",
            color: "bg-blue-100 text-blue-800 border-blue-300",
            description: "The kitchen is preparing your order",
        },
        READY: {
            icon: Utensils,
            label: "Ready to Serve",
            color: "bg-green-100 text-green-800 border-green-300",
            description:
                "Your order is ready! A staff member will serve it shortly",
        },
        SERVED: {
            icon: CheckCircle2,
            label: "Served",
            color: "bg-gray-100 text-gray-800 border-gray-300",
            description: "Enjoy your meal!",
        },
    };

    const status =
        statusConfig[order.status as keyof typeof statusConfig] ||
        statusConfig.PENDING;
    const StatusIcon = status.icon;

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Order Status</h1>
                <Button
                    variant="ghost"
                    onClick={() =>
                        router.push(`/menu/${orgSlug}/${tableToken}`)
                    }
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Menu
                </Button>
            </div>

            {/* Success Message */}
            <Card className="p-6 mb-6 bg-green-50 border-green-200">
                <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                    <div>
                        <h2 className="font-semibold text-lg mb-1">
                            Order Submitted!
                        </h2>
                        <p className="text-sm text-gray-600">
                            Order #{order.orderNumber} • Estimated time: 15-20
                            minutes
                        </p>
                    </div>
                </div>
            </Card>

            {/* Current Status */}
            <Card className={`p-6 mb-6 border-2 ${status.color}`}>
                <div className="flex items-center gap-4 mb-3">
                    <StatusIcon className="h-10 w-10" />
                    <div>
                        <h3 className="font-bold text-xl">{status.label}</h3>
                        <p className="text-sm mt-1">{status.description}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs mb-2">
                        <span>Received</span>
                        <span>Preparing</span>
                        <span>Ready</span>
                        <span>Served</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{
                                width:
                                    order.status === "PENDING"
                                        ? "25%"
                                        : order.status === "PREPARING"
                                          ? "50%"
                                          : order.status === "READY"
                                            ? "75%"
                                            : order.status === "SERVED"
                                              ? "100%"
                                              : "0%",
                            }}
                        />
                    </div>
                </div>
            </Card>

            {/* Order Items */}
            <Card className="p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4">Your Order</h3>
                <div className="space-y-3">
                    {order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between">
                            <div className="flex-1">
                                <p className="font-medium">
                                    {item.menuItem.name}
                                </p>
                                {item.specialRequest && (
                                    <p className="text-sm text-gray-600">
                                        Note: {item.specialRequest}
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="font-medium">×{item.quantity}</p>
                                <p className="text-sm text-gray-600">
                                    ฿{item.totalPrice}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                        router.push(
                            `/menu/${orgSlug}/${tableToken}/bill?sessionId=${session?.sessionId}`,
                        )
                    }
                >
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Bill
                </Button>

                <Button
                    className="w-full"
                    onClick={() =>
                        router.push(`/menu/${orgSlug}/${tableToken}`)
                    }
                >
                    Order More Items
                </Button>
            </div>

            {/* Auto-refresh indicator */}
            <p className="text-xs text-center text-gray-500 mt-6">
                Status updates automatically every 5 seconds
            </p>
        </div>
    );
}

function OrderStatusSkeleton() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
}

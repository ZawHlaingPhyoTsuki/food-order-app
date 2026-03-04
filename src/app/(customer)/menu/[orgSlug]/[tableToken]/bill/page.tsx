"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Receipt } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { API_ROUTES, api } from "@/lib/api-routes-flat";

export default function BillPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const { orgSlug, tableToken } = params as {
        orgSlug: string;
        tableToken: string;
    };

    const sessionId = searchParams.get("sessionId");

    // Fetch bill (poll every 10 seconds)
    const { data: bill, isLoading } = useQuery({
        queryKey: ["bill", tableToken, sessionId],
        queryFn: () => {
            if (!sessionId) throw new Error("Session ID required");
            return api.get(API_ROUTES.CUSTOMER_BILL_GET(tableToken, sessionId));
        },
        enabled: !!sessionId,
        refetchInterval: 10000, // Poll every 10 seconds
    });

    if (isLoading) {
        return <BillSkeleton />;
    }

    if (!bill) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-2">No Active Bill</h2>
                <p className="text-gray-600 mb-6">
                    You don't have any unpaid orders at this table.
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

    const isPaid = bill.orders.length === 0 || bill.isPaid;

    return (
        <div className="max-w-2xl mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold ml-2">Table Bill</h1>
                </div>
                <Receipt className="h-6 w-6 text-gray-400" />
            </div>

            {isPaid ? (
                <Card className="p-6 bg-green-50 border-green-200 mb-6">
                    <p className="text-center font-semibold text-green-800">
                        ✓ All orders have been paid. Thank you!
                    </p>
                </Card>
            ) : (
                <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
                    <p className="text-sm text-blue-800">
                        This is your running bill. All orders from your table
                        session are shown below.
                    </p>
                </Card>
            )}

            {/* Orders */}
            <div className="space-y-6 mb-6">
                {bill.orders.map((order: any, index: number) => (
                    <Card key={order.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-lg">
                                    Order #{order.orderNumber}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {format(
                                        new Date(order.createdAt),
                                        "h:mm a",
                                    )}
                                </p>
                            </div>
                            <Badge
                                variant={
                                    order.status === "SERVED"
                                        ? "default"
                                        : "secondary"
                                }
                            >
                                {order.status}
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            {order.items.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between text-sm"
                                >
                                    <div className="flex-1">
                                        <p>{item.menuItem.name}</p>
                                        {item.specialRequest && (
                                            <p className="text-xs text-gray-600">
                                                {item.specialRequest}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p>×{item.quantity}</p>
                                        <p className="text-gray-600">
                                            ฿{item.totalPrice}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Separator className="my-3" />

                        <div className="flex justify-between font-semibold">
                            <span>Order Total</span>
                            <span>฿{order.total}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Summary */}
            {!isPaid && (
                <>
                    <Card className="p-6 mb-6">
                        <h3 className="font-semibold text-lg mb-4">
                            Bill Summary
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span>฿{bill.summary.subtotal}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax (7%)</span>
                                <span>฿{bill.summary.taxAmount}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Service Charge (10%)
                                </span>
                                <span>฿{bill.summary.serviceAmount}</span>
                            </div>

                            <Separator />

                            <div className="flex justify-between text-2xl font-bold">
                                <span>Total Amount</span>
                                <span>฿{bill.summary.total}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Payment Instructions */}
                    <Card className="p-6 bg-amber-50 border-amber-200">
                        <h3 className="font-semibold mb-2">Ready to Pay?</h3>
                        <p className="text-sm text-gray-700 mb-4">
                            Please show this bill to our staff at the counter or
                            request payment at your table.
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1">
                                💵 Pay at Counter
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                disabled
                            >
                                💳 Pay by Card
                                <span className="text-xs ml-1">
                                    (Coming Soon)
                                </span>
                            </Button>
                        </div>
                    </Card>
                </>
            )}

            <p className="text-xs text-center text-gray-500 mt-6">
                Bill updates automatically every 10 seconds
            </p>
        </div>
    );
}

function BillSkeleton() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    );
}

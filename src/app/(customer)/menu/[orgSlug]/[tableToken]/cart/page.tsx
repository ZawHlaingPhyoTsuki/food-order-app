"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CartItemCard } from "@/components/customer/cart-item-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import { API_ROUTES, api } from "@/lib/api-routes-flat";

export default function CartPage() {
    const params = useParams();
    const router = useRouter();
    const { orgSlug, tableToken } = params as {
        orgSlug: string;
        tableToken: string;
    };

    const { items, session, subtotal, clearCart } = useCart();
    const [notes, setNotes] = useState("");

    // Calculate totals
    const taxRate = 0.07; // 7%
    const serviceRate = 0.1; // 10%
    const taxAmount = Math.round(subtotal * taxRate);
    const serviceAmount = Math.round(subtotal * serviceRate);
    const total = subtotal + taxAmount + serviceAmount;

    // Submit order mutation
    const submitOrder = useMutation({
        mutationFn: async () => {
            if (!session) throw new Error("No session");

            return api.post(API_ROUTES.CUSTOMER_ORDER_CREATE, {
                sessionId: session.sessionId,
                tableToken: session.tableToken,
                items: items.map((item) => ({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    specialRequest: item.specialRequest,
                })),
                notes: notes || undefined,
            });
        },
        onSuccess: (data) => {
            clearCart();
            toast.success("Order submitted successfully!");
            router.push(
                `/menu/${orgSlug}/${tableToken}/status?orderId=${data.orderId}`,
            );
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to submit order");
        },
    });

    const handleSubmit = () => {
        if (items.length === 0) {
            toast.error("Your cart is empty");
            return;
        }
        submitOrder.mutate();
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">
                        Your Cart is Empty
                    </h2>
                    <p className="text-gray-600">
                        Add some items from the menu to get started
                    </p>
                </div>
                <Button onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Menu
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold ml-2">Your Order</h1>
            </div>

            {session && (
                <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
                    <p className="text-sm">
                        <span className="font-semibold">Table:</span>{" "}
                        {session.tableNumber}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        Session ID: {session.sessionId.slice(0, 8)}...
                    </p>
                </Card>
            )}

            {/* Cart Items */}
            <div className="space-y-3 mb-6">
                {items.map((item) => (
                    <CartItemCard key={item.id} item={item} />
                ))}
            </div>

            {/* Table Notes */}
            <Card className="p-4 mb-6">
                <Label htmlFor="table-notes">Table Notes (Optional)</Label>
                <Textarea
                    id="table-notes"
                    placeholder="e.g., Please bring plates for sharing"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2"
                    rows={3}
                />
            </Card>

            {/* Order Summary */}
            <Card className="p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4">Order Summary</h3>

                <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>฿{subtotal}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                        <span>Tax (7%)</span>
                        <span>฿{taxAmount}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                        <span>Service Charge (10%)</span>
                        <span>฿{serviceAmount}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span>฿{total}</span>
                    </div>
                </div>
            </Card>

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={submitOrder.isPending}
                className="w-full"
                size="lg"
            >
                {submitOrder.isPending ? (
                    "Submitting..."
                ) : (
                    <>
                        <Send className="h-5 w-5 mr-2" />
                        Send to Kitchen
                    </>
                )}
            </Button>

            <p className="text-xs text-center text-gray-500 mt-4">
                Your order will be sent to the kitchen immediately
            </p>
        </div>
    );
}

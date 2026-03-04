"use client";

import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";

interface CartItemCardProps {
    item: {
        id: string;
        name: string;
        price: number;
        quantity: number;
        specialRequest?: string;
    };
}

export function CartItemCard({ item }: CartItemCardProps) {
    const { updateQuantity, removeItem } = useCart();

    return (
        <Card className="p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.name}</h3>
                    {item.specialRequest && (
                        <p className="text-sm text-gray-600 mb-2">
                            Note: {item.specialRequest}
                        </p>
                    )}
                    <p className="text-sm text-gray-500">
                        ฿{item.price} × {item.quantity}
                    </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    {/* Price */}
                    <span className="font-bold text-lg">
                        ฿{item.price * item.quantity}
                    </span>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                            }
                        >
                            <Minus className="h-4 w-4" />
                        </Button>

                        <span className="w-8 text-center font-semibold">
                            {item.quantity}
                        </span>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                            }
                        >
                            <Plus className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => removeItem(item.id)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}

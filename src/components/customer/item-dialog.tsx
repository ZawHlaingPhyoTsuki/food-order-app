"use client";

import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";

interface ItemDialogProps {
    item: {
        id: string;
        name: string;
        description?: string;
        price: number;
        image?: string;
    };
    open: boolean;
    onClose: () => void;
}

export function ItemDialog({ item, open, onClose }: ItemDialogProps) {
    const [quantity, setQuantity] = useState(1);
    const [specialRequest, setSpecialRequest] = useState("");
    const { addItem } = useCart();

    const handleAdd = () => {
        for (let i = 0; i < quantity; i++) {
            addItem({
                id: crypto.randomUUID(),
                menuItemId: item.id,
                name: item.name,
                price: item.price,
                specialRequest: specialRequest || undefined,
            });
        }
        onClose();
        setQuantity(1);
        setSpecialRequest("");
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{item.name}</DialogTitle>
                </DialogHeader>

                {item.image && (
                    <div className="relative h-64 w-full rounded-lg overflow-hidden">
                        <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                {item.description && (
                    <p className="text-gray-600">{item.description}</p>
                )}

                <div className="space-y-4">
                    {/* Quantity */}
                    <div>
                        <Label>Quantity</Label>
                        <div className="flex items-center gap-4 mt-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                    setQuantity(Math.max(1, quantity - 1))
                                }
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-xl font-semibold w-12 text-center">
                                {quantity}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Special Request */}
                    <div>
                        <Label htmlFor="special-request">
                            Special Request (Optional)
                        </Label>
                        <Textarea
                            id="special-request"
                            placeholder="e.g., No onions, extra spicy"
                            value={specialRequest}
                            onChange={(e) => setSpecialRequest(e.target.value)}
                            className="mt-2"
                        />
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between text-xl font-bold pt-4 border-t">
                        <span>Total:</span>
                        <span>฿{item.price * quantity}</span>
                    </div>

                    {/* Add Button */}
                    <Button onClick={handleAdd} className="w-full" size="lg">
                        Add to Cart
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

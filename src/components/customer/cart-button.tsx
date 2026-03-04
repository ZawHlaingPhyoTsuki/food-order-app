"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

export function CartButton() {
    const { totalItems, session } = useCart();
    const router = useRouter();

    if (totalItems === 0) return null;

    const handleClick = () => {
        if (session) {
            router.push(
                `/menu/${session.organizationId}/${session.tableToken}/cart`,
            );
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Button
                size="lg"
                onClick={handleClick}
                className="relative shadow-lg"
            >
                <ShoppingCart className="h-5 w-5 mr-2" />
                View Cart
                <Badge className="ml-2 bg-white text-primary hover:bg-white">
                    {totalItems}
                </Badge>
            </Button>
        </div>
    );
}

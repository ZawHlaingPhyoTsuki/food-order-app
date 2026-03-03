"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { ItemDialog } from "./item-dialog";

interface MenuItemCardProps {
    item: {
        id: string;
        name: string;
        nameEn?: string;
        nameTh?: string;
        description?: string;
        price: number;
        image?: string;
    };
}

export function MenuItemCard({ item }: MenuItemCardProps) {
    const [showDialog, setShowDialog] = useState(false);
    const { addItem } = useCart();

    const handleQuickAdd = () => {
        addItem({
            id: crypto.randomUUID(),
            menuItemId: item.id,
            name: item.name,
            price: item.price,
        });
    };

    return (
        <>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div
                    className="cursor-pointer"
                    onClick={() => setShowDialog(true)}
                >
                    {item.image && (
                        <div className="relative h-48 w-full">
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                    <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1">
                            {item.name}
                        </h3>
                        {item.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {item.description}
                            </p>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-xl font-bold">
                                ฿{item.price}
                            </span>
                            <Button
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickAdd();
                                }}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <ItemDialog
                item={item}
                open={showDialog}
                onClose={() => setShowDialog(false)}
            />
        </>
    );
}

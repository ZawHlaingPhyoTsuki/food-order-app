"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CartButton } from "@/components/customer/cart-button";
import { MenuItemCard } from "@/components/customer/menu-item-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { API_ROUTES, api } from "@/lib/api-routes-flat";

export default function MenuPage() {
    const params = useParams();
    const router = useRouter();
    const { orgSlug, tableToken } = params as {
        orgSlug: string;
        tableToken: string;
    };

    const { initializeSession } = useCart();

    // Fetch menu
    const { data: menu, isLoading: menuLoading } = useQuery({
        queryKey: ["menu", orgSlug],
        queryFn: () => api.get(API_ROUTES.CUSTOMER_MENU(orgSlug)),
    });

    // Create/join table session
    const { data: session, isLoading: sessionLoading } = useQuery({
        queryKey: ["session", tableToken],
        queryFn: () => api.post(API_ROUTES.CUSTOMER_SESSION_CREATE(tableToken)),
        staleTime: 1000 * 60 * 30, // 30 minutes
    });

    useEffect(() => {
        if (session) {
            initializeSession(session);
        }
    }, [session, initializeSession]);

    if (menuLoading || sessionLoading) {
        return <MenuSkeleton />;
    }

    if (!menu) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-2">
                    Restaurant Not Found
                </h2>
                <p className="text-gray-600">
                    This restaurant may be inactive or the link is invalid.
                </p>
            </div>
        );
    }

    return (
        <div className="pb-24">
            {/* Restaurant Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-1">{menu.name}</h1>
                {menu.description && (
                    <p className="text-gray-600">{menu.description}</p>
                )}
                {session && (
                    <p className="text-sm text-gray-500 mt-2">
                        Table: {session.tableNumber}
                    </p>
                )}
            </div>

            {/* Menu Categories */}
            {menu.menuCategories.map((category: any) => (
                <div key={category.id} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.menuItems.map((item: any) => (
                            <MenuItemCard key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            ))}

            {/* Floating Cart Button */}
            <CartButton />
        </div>
    );
}

function MenuSkeleton() {
    return (
        <div className="space-y-8">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                ))}
            </div>
        </div>
    );
}

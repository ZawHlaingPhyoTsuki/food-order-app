"use client";

import {
    BarChart3,
    ChefHat,
    LayoutDashboard,
    Menu,
    Settings,
    ShoppingBag,
    Store,
    TableProperties,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tables", href: "/dashboard/tables", icon: TableProperties },
    { name: "Menu", href: "/dashboard/menu", icon: Menu },
    { name: "Kitchen", href: "/dashboard/kitchen", icon: ChefHat },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-white border-r flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b">
                <div className="flex items-center gap-2">
                    <Store className="h-8 w-8 text-primary" />
                    <span className="font-bold text-xl">Restaurant</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link key={item.name} href={item.href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                    isActive &&
                                        "bg-primary/10 text-primary hover:bg-primary/20",
                                )}
                            >
                                <Icon className="h-5 w-5 mr-3" />
                                {item.name}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                    Food Order App v1.0
                </p>
            </div>
        </div>
    );
}

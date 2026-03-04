"use client";

import { useQuery } from "@tanstack/react-query";
import {
    BarChart3,
    Building2,
    Clock,
    LayoutDashboard,
    Settings,
    Shield,
    Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_ROUTES, api } from "@/lib/api-routes-flat";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    {
        name: "Pending Approvals",
        href: "/admin/pending",
        icon: Clock,
        badge: true,
    },
    { name: "All Restaurants", href: "/admin/restaurants", icon: Building2 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();

    // Get pending count
    const { data: pendingOrgs } = useQuery({
        queryKey: ["admin-pending-count"],
        queryFn: () => api.get(API_ROUTES.ADMIN_ORGANIZATIONS_PENDING),
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    const pendingCount = pendingOrgs?.length || 0;

    return (
        <div className="w-64 bg-gray-900 text-white flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <Shield className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="font-bold text-xl">Admin Panel</h1>
                        <p className="text-xs text-gray-400">
                            Food Order System
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    const showBadge = item.badge && pendingCount > 0;

                    return (
                        <Link key={item.name} href={item.href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start text-white hover:text-white hover:bg-gray-800",
                                    isActive && "bg-gray-800 text-white",
                                )}
                            >
                                <Icon className="h-5 w-5 mr-3" />
                                <span className="flex-1 text-left">
                                    {item.name}
                                </span>
                                {showBadge && (
                                    <Badge
                                        variant="destructive"
                                        className="ml-auto"
                                    >
                                        {pendingCount}
                                    </Badge>
                                )}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
                <p className="text-xs text-gray-400 text-center">
                    Admin Dashboard v1.0
                </p>
            </div>
        </div>
    );
}

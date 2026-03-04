"use client";

import { useQuery } from "@tanstack/react-query";
import { Menu, ShoppingBag, TableProperties, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { API_ROUTES, api } from "@/lib/api-routes-flat";

export default function DashboardPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            // This would be a custom endpoint for dashboard stats
            const [tables, items, orders] = await Promise.all([
                api.get(API_ROUTES.RESTAURANT_TABLES_LIST),
                api.get(API_ROUTES.RESTAURANT_ITEMS_LIST),
                api.get(API_ROUTES.RESTAURANT_ORDERS_LIST),
            ]);

            return {
                tables: {
                    total: tables.length,
                    occupied: tables.filter((t: any) => t.status === "OCCUPIED")
                        .length,
                },
                menuItems: items.length,
                todayOrders: orders.orders.length,
                todayRevenue: orders.orders.reduce(
                    (sum: number, order: any) =>
                        sum + (order.isPaid ? order.total : 0),
                    0,
                ),
            };
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    const statCards = [
        {
            title: "Tables",
            value: `${stats?.tables.occupied || 0}/${stats?.tables.total || 0}`,
            description: "Occupied",
            icon: TableProperties,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Menu Items",
            value: stats?.menuItems || 0,
            description: "Active items",
            icon: Menu,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Today's Orders",
            value: stats?.todayOrders || 0,
            description: "Total orders",
            icon: ShoppingBag,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Today's Revenue",
            value: `฿${stats?.todayRevenue || 0}`,
            description: "Total sales",
            icon: TrendingUp,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
                <p className="text-gray-600">Here's what's happening today</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className={`p-3 rounded-lg ${stat.bgColor}`}
                                >
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">
                                    {stat.title}
                                </p>
                                <p className="text-3xl font-bold mb-1">
                                    {stat.value}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {stat.description}
                                </p>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Activity - You can expand this */}
            <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                <p className="text-gray-600">
                    Recent orders and updates will appear here
                </p>
            </Card>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((value) => (
                    <Skeleton key={value} className="h-32" />
                ))}
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import {
    AlertCircle,
    Building2,
    CheckCircle,
    Clock,
    ShoppingBag,
    TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { API_ROUTES, api } from "@/lib/api-routes-flat";

export default function AdminOverviewPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: () => api.get(API_ROUTES.ADMIN_STATS),
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    if (isLoading) {
        return <OverviewSkeleton />;
    }

    const statCards = [
        {
            title: "Total Restaurants",
            value: stats?.organizations.total || 0,
            icon: Building2,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Active Restaurants",
            value: stats?.organizations.active || 0,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Pending Approvals",
            value: stats?.organizations.pending || 0,
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100",
        },
        {
            title: "Suspended",
            value: stats?.organizations.suspended || 0,
            icon: AlertCircle,
            color: "text-red-600",
            bgColor: "bg-red-100",
        },
        {
            title: "Total Orders",
            value: stats?.orders.total || 0,
            icon: ShoppingBag,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Today's Orders",
            value: stats?.orders.today || 0,
            icon: TrendingUp,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Platform Overview</h1>
                <p className="text-gray-600">
                    Monitor your food ordering platform
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                <p className="text-3xl font-bold">
                                    {stat.value}
                                </p>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Platform Health</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Active Rate</span>
                            <Badge variant="secondary">
                                {stats?.organizations.total > 0
                                    ? Math.round(
                                          (stats.organizations.active /
                                              stats.organizations.total) *
                                              100,
                                      )
                                    : 0}
                                %
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">
                                Approval Pending
                            </span>
                            <Badge variant="outline">
                                {stats?.organizations.pending || 0}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Revenue</span>
                            <span className="font-bold">
                                ฿{stats?.revenue?.total || 0}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                    <p className="text-gray-600 text-sm">
                        Activity logs will be displayed here
                    </p>
                </Card>
            </div>
        </div>
    );
}

function OverviewSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((value) => (
                    <Skeleton key={value} className="h-32" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
            </div>
        </div>
    );
}

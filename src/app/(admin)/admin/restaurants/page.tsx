"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
    Ban,
    Building2,
    CheckCircle,
    Eye,
    MoreVertical,
    Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { API_ROUTES, api } from "@/lib/api-routes-flat";

export default function AllRestaurantsPage() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-restaurants", statusFilter, page],
        queryFn: () =>
            api.get(
                API_ROUTES.ADMIN_ORGANIZATIONS_LIST({
                    status: statusFilter === "all" ? undefined : statusFilter,
                    page,
                    limit: 20,
                }),
            ),
    });

    const suspendMutation = useMutation({
        mutationFn: (id: string) =>
            api.post(API_ROUTES.ADMIN_ORGANIZATION_SUSPEND(id), {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
            toast.success("Restaurant suspended");
        },
    });

    const reactivateMutation = useMutation({
        mutationFn: (id: string) =>
            api.post(API_ROUTES.ADMIN_ORGANIZATION_REACTIVATE(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
            toast.success("Restaurant reactivated");
        },
    });

    const filteredOrganizations = data?.organizations.filter((org: any) =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const statusColors = {
        ACTIVE: "bg-green-100 text-green-800",
        PENDING: "bg-yellow-100 text-yellow-800",
        SUSPENDED: "bg-red-100 text-red-800",
        REJECTED: "bg-gray-100 text-gray-800",
    };

    if (isLoading) {
        return <RestaurantsSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">All Restaurants</h1>
                <p className="text-gray-600">
                    Manage all restaurants on the platform
                </p>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search restaurants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">
                        {data?.pagination.total || 0}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                        {data?.organizations.filter(
                            (o: any) => o.status === "ACTIVE",
                        ).length || 0}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {data?.organizations.filter(
                            (o: any) => o.status === "PENDING",
                        ).length || 0}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-600">Suspended</p>
                    <p className="text-2xl font-bold text-red-600">
                        {data?.organizations.filter(
                            (o: any) => o.status === "SUSPENDED",
                        ).length || 0}
                    </p>
                </Card>
            </div>

            {/* Restaurants List */}
            <div className="space-y-4">
                {filteredOrganizations?.map((org: any) => (
                    <Card key={org.id} className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4 flex-1">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold">
                                            {org.name}
                                        </h3>
                                        <Badge
                                            className={
                                                statusColors[
                                                    org.status as keyof typeof statusColors
                                                ]
                                            }
                                        >
                                            {org.status}
                                        </Badge>
                                    </div>
                                    {org.description && (
                                        <p className="text-gray-600 text-sm mb-3">
                                            {org.description}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        <span>Owner: {org.owner.email}</span>
                                        {org.city && <span>📍 {org.city}</span>}
                                        <span>Tables: {org._count.tables}</span>
                                        <span>
                                            Menu Items: {org._count.menuItems}
                                        </span>
                                        <span>Orders: {org._count.orders}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Created:{" "}
                                        {format(
                                            new Date(org.createdAt),
                                            "MMM d, yyyy",
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`/admin/restaurants/${org.id}`}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </Link>
                                    </DropdownMenuItem>
                                    {org.status === "ACTIVE" && (
                                        <DropdownMenuItem
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        "Suspend this restaurant?",
                                                    )
                                                ) {
                                                    suspendMutation.mutate(
                                                        org.id,
                                                    );
                                                }
                                            }}
                                        >
                                            <Ban className="h-4 w-4 mr-2" />
                                            Suspend
                                        </DropdownMenuItem>
                                    )}
                                    {org.status === "SUSPENDED" && (
                                        <DropdownMenuItem
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        "Reactivate this restaurant?",
                                                    )
                                                ) {
                                                    reactivateMutation.mutate(
                                                        org.id,
                                                    );
                                                }
                                            }}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Reactivate
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4">
                        Page {page} of {data.pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={!data.pagination.hasNext}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}

function RestaurantsSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((value) => (
                    <Skeleton key={value} className="h-24" />
                ))}
            </div>
            {[1, 2, 3, 4, 5].map((value) => (
                <Skeleton key={value} className="h-32" />
            ))}
        </div>
    );
}

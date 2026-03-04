"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
    Calendar,
    CheckCircle,
    Mail,
    MapPin,
    Phone,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { API_ROUTES, api } from "@/lib/api-routes-flat";

export default function PendingApprovalsPage() {
    const queryClient = useQueryClient();
    const [rejectDialog, setRejectDialog] = useState<{
        open: boolean;
        orgId: string | null;
    }>({
        open: false,
        orgId: null,
    });
    const [rejectReason, setRejectReason] = useState("");

    const { data: organizations, isLoading } = useQuery({
        queryKey: ["admin-pending"],
        queryFn: () => api.get(API_ROUTES.ADMIN_ORGANIZATIONS_PENDING),
        refetchInterval: 30000,
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) =>
            api.post(API_ROUTES.ADMIN_ORGANIZATION_APPROVE(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-pending"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            toast.success("Restaurant approved successfully!");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to approve restaurant");
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            api.post(API_ROUTES.ADMIN_ORGANIZATION_REJECT(id), { reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-pending"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            setRejectDialog({ open: false, orgId: null });
            setRejectReason("");
            toast.success("Restaurant rejected");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to reject restaurant");
        },
    });

    const handleApprove = (id: string) => {
        if (confirm("Are you sure you want to approve this restaurant?")) {
            approveMutation.mutate(id);
        }
    };

    const handleReject = () => {
        if (!rejectReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        if (rejectDialog.orgId) {
            rejectMutation.mutate({
                id: rejectDialog.orgId,
                reason: rejectReason,
            });
        }
    };

    if (isLoading) {
        return <PendingSkeleton />;
    }

    if (!organizations || organizations.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Pending Approvals</h1>
                <Card className="p-12 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
                    <p className="text-gray-600">
                        No pending restaurant applications at the moment.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Pending Approvals</h1>
                    <p className="text-gray-600">
                        {organizations.length} restaurant
                        {organizations.length !== 1 ? "s" : ""} waiting for
                        approval
                    </p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                    {organizations.length} Pending
                </Badge>
            </div>

            <div className="space-y-4">
                {organizations.map((org: any) => (
                    <Card key={org.id} className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <h3 className="text-2xl font-bold">
                                        {org.name}
                                    </h3>
                                    <Badge variant="secondary">
                                        {org.status}
                                    </Badge>
                                </div>

                                {org.description && (
                                    <p className="text-gray-600 mb-4">
                                        {org.description}
                                    </p>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* Owner Info */}
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm text-gray-500 uppercase">
                                            Owner Information
                                        </h4>
                                        <div className="space-y-1">
                                            <p className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <span>{org.owner.email}</span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span>
                                                    Registered:{" "}
                                                    {format(
                                                        new Date(
                                                            org.owner.createdAt,
                                                        ),
                                                        "MMM d, yyyy",
                                                    )}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Restaurant Info */}
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm text-gray-500 uppercase">
                                            Restaurant Details
                                        </h4>
                                        <div className="space-y-1">
                                            {org.phone && (
                                                <p className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    <span>{org.phone}</span>
                                                </p>
                                            )}
                                            {org.address && (
                                                <p className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <span>
                                                        {org.address}
                                                        {org.city &&
                                                            `, ${org.city}`}
                                                    </span>
                                                </p>
                                            )}
                                            <p className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span>
                                                    Applied:{" "}
                                                    {format(
                                                        new Date(org.createdAt),
                                                        "MMM d, yyyy h:mm a",
                                                    )}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4 border-t">
                                    <Button
                                        onClick={() => handleApprove(org.id)}
                                        disabled={approveMutation.isPending}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve Restaurant
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() =>
                                            setRejectDialog({
                                                open: true,
                                                orgId: org.id,
                                            })
                                        }
                                        disabled={rejectMutation.isPending}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Reject Dialog */}
            <Dialog
                open={rejectDialog.open}
                onOpenChange={(open) => setRejectDialog({ open, orgId: null })}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Restaurant Application</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="reason">
                                Reason for Rejection{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="reason"
                                placeholder="Please provide a detailed reason for rejection..."
                                value={rejectReason}
                                onChange={(e) =>
                                    setRejectReason(e.target.value)
                                }
                                rows={4}
                                className="mt-2"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                This will be sent to the restaurant owner
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRejectDialog({ open: false, orgId: null });
                                setRejectReason("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={
                                rejectMutation.isPending || !rejectReason.trim()
                            }
                        >
                            {rejectMutation.isPending
                                ? "Rejecting..."
                                : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function PendingSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-20 w-full" />
            {[1, 2, 3].map((value) => (
                <Skeleton key={value} className="h-64" />
            ))}
        </div>
    );
}

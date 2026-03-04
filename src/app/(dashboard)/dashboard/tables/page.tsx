"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Plus, QrCode, RotateCw, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { API_ROUTES, api } from "@/lib/api-routes-flat";

export default function TablesPage() {
    const queryClient = useQueryClient();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedTable, setSelectedTable] = useState<any>(null);
    const [showQRDialog, setShowQRDialog] = useState(false);

    // Fetch tables
    const { data: tables, isLoading } = useQuery({
        queryKey: ["tables"],
        queryFn: () => api.get(API_ROUTES.RESTAURANT_TABLES_LIST),
    });

    // Create table mutation
    const createTable = useMutation({
        mutationFn: (data: { tableNumber: string }) =>
            api.post(API_ROUTES.RESTAURANT_TABLES_CREATE, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tables"] });
            setShowAddDialog(false);
            toast.success("Table created successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create table");
        },
    });

    // Delete table mutation
    const deleteTable = useMutation({
        mutationFn: (id: string) =>
            api.delete(API_ROUTES.RESTAURANT_TABLE_DELETE(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tables"] });
            toast.success("Table deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete table");
        },
    });

    // Clear table mutation
    const clearTable = useMutation({
        mutationFn: (id: string) =>
            api.patch(API_ROUTES.RESTAURANT_TABLE_CLEAR(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tables"] });
            toast.success("Table cleared successfully");
        },
    });

    if (isLoading) {
        return <TablesSkeleton />;
    }

    const statusColors = {
        FREE: "bg-green-100 text-green-800 border-green-300",
        OCCUPIED: "bg-blue-100 text-blue-800 border-blue-300",
        NEEDS_CLEANING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Tables</h2>
                    <p className="text-gray-600">
                        Manage your restaurant tables
                    </p>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Table
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Table</DialogTitle>
                        </DialogHeader>
                        <AddTableForm
                            onSubmit={(data) => createTable.mutate(data)}
                            isLoading={createTable.isPending}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tables Grid */}
            {tables?.length === 0 ? (
                <Card className="p-12 text-center">
                    <p className="text-gray-600 mb-4">No tables yet</p>
                    <Button onClick={() => setShowAddDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Table
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tables?.map((table: any) => (
                        <Card key={table.id} className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">
                                        Table {table.tableNumber}
                                    </h3>
                                    <Badge
                                        className={
                                            statusColors[
                                                table.status as keyof typeof statusColors
                                            ]
                                        }
                                    >
                                        {table.status.replace("_", " ")}
                                    </Badge>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setSelectedTable(table);
                                        setShowQRDialog(true);
                                    }}
                                >
                                    <QrCode className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="text-xs text-gray-500 mb-4">
                                <p>
                                    Created:{" "}
                                    {new Date(
                                        table.createdAt,
                                    ).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                {table.status === "OCCUPIED" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            clearTable.mutate(table.id)
                                        }
                                        disabled={clearTable.isPending}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Clear
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm("Delete this table?")) {
                                            deleteTable.mutate(table.id);
                                        }
                                    }}
                                    disabled={deleteTable.isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* QR Code Dialog */}
            <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Table {selectedTable?.tableNumber} QR Code
                        </DialogTitle>
                    </DialogHeader>
                    {selectedTable && <QRCodeView table={selectedTable} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function AddTableForm({
    onSubmit,
    isLoading,
}: {
    onSubmit: (data: { tableNumber: string }) => void;
    isLoading: boolean;
}) {
    const [tableNumber, setTableNumber] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ tableNumber });
        setTableNumber("");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="tableNumber">Table Number</Label>
                <Input
                    id="tableNumber"
                    placeholder="e.g., 1, A1, VIP-1"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    required
                />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Creating..." : "Create Table"}
            </Button>
        </form>
    );
}

function QRCodeView({ table }: { table: any }) {
    const queryClient = useQueryClient();

    // Fetch QR code (in real implementation, this would come from the create response)
    const { data: qrData } = useQuery({
        queryKey: ["table-qr", table.id],
        queryFn: async () => {
            // For now, generate URL
            const url = `${process.env.NEXT_PUBLIC_APP_URL}/menu/${table.organization?.slug || "demo"}/${table.tableToken}`;
            return { url, qrCodeUrl: null }; // You'd generate QR on backend
        },
    });

    const regenerateQR = useMutation({
        mutationFn: () =>
            api.post(API_ROUTES.RESTAURANT_TABLE_REGENERATE_QR(table.id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["table-qr", table.id] });
            queryClient.invalidateQueries({ queryKey: ["tables"] });
            toast.success("QR code regenerated");
        },
    });

    return (
        <div className="space-y-4">
            <div className="bg-gray-100 p-6 rounded-lg text-center">
                {qrData?.qrCodeUrl ? (
                    <Image
                        src={qrData.qrCodeUrl}
                        alt="QR Code"
                        width={300}
                        height={300}
                        className="mx-auto"
                    />
                ) : (
                    <div className="w-64 h-64 bg-white mx-auto flex items-center justify-center">
                        <p className="text-gray-500">
                            QR Code will appear here
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Table URL:</p>
                <code className="text-xs break-all">{qrData?.url}</code>
            </div>

            <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                    Download QR
                </Button>
                <Button
                    variant="outline"
                    onClick={() => regenerateQR.mutate()}
                    disabled={regenerateQR.isPending}
                >
                    <RotateCw className="h-4 w-4 mr-2" />
                    Regenerate
                </Button>
            </div>
        </div>
    );
}

function TablesSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-48" />
                ))}
            </div>
        </div>
    );
}

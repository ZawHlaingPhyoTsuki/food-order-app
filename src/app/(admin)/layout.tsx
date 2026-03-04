"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/login");
        }
        if (!isPending && session?.user?.role !== "SUPER_ADMIN") {
            router.push("/dashboard");
        }
    }, [session, isPending, router]);

    if (isPending) {
        return <AdminSkeleton />;
    }

    if (!session || session.user.role !== "SUPER_ADMIN") {
        return null;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

function AdminSkeleton() {
    return (
        <div className="flex h-screen">
            <Skeleton className="w-64 h-full" />
            <div className="flex-1 p-6">
                <Skeleton className="h-12 w-full mb-6" />
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
}

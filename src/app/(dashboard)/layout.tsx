"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";

export default function DashboardLayout({
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
    }, [session, isPending, router]);

    if (isPending) {
        return <DashboardSkeleton />;
    }

    if (!session) {
        return null;
    }

    if (session.user.role !== "OWNER") {
        console.log(
            "Unauthorized access attempt to dashboard by user:",
            session.user,
        );
        return (
            <div>
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p>You do not have permission to access this page.</p>
                {session.user.role === "SUPER_ADMIN" && (
                    <Link
                        href="/admin"
                        className="text-blue-500 hover:underline"
                    >
                        Admin Dashboard
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
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

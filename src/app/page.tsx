import Link from "next/link";

export default function Home() {
    return (
        <div className="flex min-h-screen items-center justify-center gap-4">
            <Link
                href="/admin"
                className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
                Admin Dashboard
            </Link>

            <Link
                href="/dashboard"
                className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
                Owner Dashboard
            </Link>

            <Link
                href="/login"
                className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
                Login
            </Link>
        </div>
    );
}

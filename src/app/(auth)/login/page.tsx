"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useState } from "react";
import SignInForm from "@/components/auth/sign-in-form";
import SignUpForm from "@/components/auth/sign-up-form";
import { useSession } from "@/lib/auth-client";

export default function LoginPage() {
    const [showSignIn, setShowSignIn] = useState(false);

    const router = useRouter();
    const { data, error } = useSession();

    if (error) {
        console.error("Error fetching session data:", error);
        return notFound();
    }

    if (data) {
        if (data.user.role === "OWNER") router.push("/dashboard");
        else router.push("/customer");
    }

    return (
        <div>
            <Link href="/" className="text-blue-500 hover:underline">
                &larr; Back to Home
            </Link>
            {showSignIn ? (
                <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
            ) : (
                <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
            )}
        </div>
    );
}

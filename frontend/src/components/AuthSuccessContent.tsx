"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AuthSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const userParam = searchParams.get("user");
        if (userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));
                if (typeof window !== "undefined") {
                    localStorage.setItem("user", JSON.stringify(user));
                    localStorage.setItem("token", user.token);
                }
                router.push("/");
            } catch (error) {
                console.error("Failed to parse user data", error);
                router.push("/login");
            }
        } else {
            router.push("/login");
        }
    }, [searchParams, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">Authenticating...</h2>
            </div>
        </div>
    );
}

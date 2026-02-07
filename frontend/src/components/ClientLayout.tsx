"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Suspense } from "react";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Suspense fallback={<div className="w-72 bg-white border-r border-gray-100 min-h-screen fixed left-0 top-0 animte-pulse" />}>
                <Sidebar />
            </Suspense>
            <main className="flex-1 ml-72">
                {children}
            </main>
        </div>
    );
}

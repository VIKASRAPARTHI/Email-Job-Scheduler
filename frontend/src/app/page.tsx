"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      <main>
        <Suspense fallback={<div className="p-8">Loading dashboard...</div>}>
          <Dashboard />
        </Suspense>
      </main>
    </div>
  );
}

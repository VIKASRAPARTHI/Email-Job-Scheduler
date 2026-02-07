"use client";

import Dashboard from "@/components/Dashboard";
import { Suspense } from "react";

export default function Home() {
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

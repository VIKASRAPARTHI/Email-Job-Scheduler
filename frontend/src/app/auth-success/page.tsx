import { Suspense } from "react";
import { AuthSuccessContent } from "@/components/AuthSuccessContent";

export default function AuthSuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
                </div>
            </div>
        }>
            <AuthSuccessContent />
        </Suspense>
    );
}

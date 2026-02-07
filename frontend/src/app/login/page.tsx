"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function LoginPage() {
    useEffect(() => {
    }, []);

    const handleGoogleLogin = () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        window.location.href = `${apiUrl}/auth/google`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Login</h1>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-3 px-4 rounded-lg transition-colors mb-6"
                >
                    <Image src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} className="w-5 h-5" />
                    Login with Google
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">or sign up through email</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="text-left">
                        <input
                            type="email"
                            placeholder="Email ID"
                            className="w-full bg-gray-50 border-none rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div className="text-left">
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full bg-gray-50 border-none rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Clock, Send, ChevronDown } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export function Sidebar() {
    const { user, logout } = useUser();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("filter") || "scheduled";

    return (
        <aside className="w-72 bg-white flex flex-col p-6 border-r border-gray-100 min-h-screen fixed left-0 top-0">
            <div className="mb-8 pl-1">
                <h1 className="text-4xl font-black tracking-tighter text-black">ONG</h1>
            </div>

            {user && (
                <div onClick={logout} className="mb-8 bg-gray-50 rounded-2xl p-3 flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="relative h-10 w-10 min-w-[40px]">
                            <Image
                                src={user.picture}
                                alt={user.name}
                                fill
                                className="rounded-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-gray-900 truncate">{user.name}</span>
                            <span className="text-xs text-gray-500 truncate">{user.email}</span>
                        </div>
                    </div>
                    <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600" />
                </div>
            )}

            <div className="mb-10">
                <Link
                    href="/compose"
                    className="flex items-center justify-center w-full border border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-semibold py-3 px-4 rounded-full transition-all text-sm"
                >
                    Compose
                </Link>
            </div>

            <nav className="flex-1 space-y-1">
                <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">CORE</p>

                <Link
                    href="/?filter=scheduled"
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-medium transition-colors ${activeTab === "scheduled"
                        ? "bg-emerald-50 text-emerald-900 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <Clock size={20} className={activeTab === "scheduled" ? "text-emerald-900" : "text-gray-400"} />
                        <span>Scheduled</span>
                    </div>
                    {activeTab === "scheduled" && (
                        <span className="text-xs font-medium text-gray-500">12</span>
                    )}
                </Link>

                <Link
                    href="/?filter=sent"
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-medium transition-colors ${activeTab === "sent"
                        ? "bg-emerald-50 text-emerald-900 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <Send size={20} className={activeTab === "sent" ? "text-emerald-900" : "text-gray-400"} />
                        <span>Sent</span>
                    </div>
                </Link>
            </nav>
        </aside>
    );
}

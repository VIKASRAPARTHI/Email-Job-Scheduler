"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { format } from "date-fns";
import { Search, Clock, Filter, RotateCcw, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";


interface EmailJob {
    id: string;
    recipient: string;
    subject: string;
    body: string;
    scheduledTime: string;
    status: "PENDING" | "SENT" | "FAILED";
    createdAt: string;
}

export default function Dashboard() {
    const searchParams = useSearchParams();
    const activeTab = (searchParams.get("filter") as "scheduled" | "sent") || "scheduled";

    const [emails, setEmails] = useState<EmailJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchEmails = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
                const res = await axios.get(`${apiUrl}/api/emails`);
                const allEmails = res.data;
                const filtered = allEmails.filter((e: EmailJob) =>
                    activeTab === "scheduled" ? e.status === "PENDING" : e.status !== "PENDING"
                );
                setEmails(filtered);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEmails();
    }, [activeTab]);

    const filteredEmails = emails.filter(email =>
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.body.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="px-8 py-6 flex items-center gap-4 bg-transparent">
                <div className="flex-1 max-w-2xl relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border-none rounded-full py-3 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:ring-1 focus:ring-gray-200 outline-none transition-all hover:bg-white/80"
                    />
                </div>
                <div className="flex items-center gap-2 text-gray-400 ml-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Filter size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={() => window.location.reload()}>
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8">
                {loading ? (
                    <div className="p-12 text-center text-gray-400 text-sm">Loading emails...</div>
                ) : filteredEmails.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 text-sm">
                        No emails found.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredEmails.map((email) => (
                            <Link
                                href={`/email/${email.id}`}
                                key={email.id}
                                className="group flex items-center py-4 px-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                            >
                                <div className="w-1/4 min-w-[200px] pr-4">
                                    <p className="text-sm font-bold text-gray-900 truncate">
                                        {email.recipient.split('@')[0]}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">
                                        {email.recipient}
                                    </p>
                                </div>

                                <div className="flex-1 min-w-0 flex items-center gap-3">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase whitespace-nowrap ${activeTab === "scheduled"
                                        ? "bg-orange-50 text-orange-600 border border-orange-100"
                                        : "bg-gray-100 text-gray-600 border border-gray-200"
                                        }`}>
                                        <Clock size={10} strokeWidth={3} />
                                        {format(new Date(activeTab === "scheduled" ? email.scheduledTime : email.createdAt), "MMM d, h:mm a")}
                                    </span>
                                    <div className="flex-1 truncate flex items-center text-sm text-gray-600">
                                        <span className="font-semibold text-gray-900 mr-1">{email.subject}</span>
                                        <span className="text-gray-400 mx-1">-</span>
                                        <span className="truncate">{email.body.substring(0, 60)}...</span>
                                    </div>
                                </div>

                                <div className="pl-4 flex items-center justify-end w-12 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-gray-300 hover:text-yellow-400 transition-colors">
                                        <Star size={18} />
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

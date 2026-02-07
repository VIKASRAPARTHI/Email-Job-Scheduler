"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { ArrowLeft, Trash, Star, MoreHorizontal, Reply, Forward } from "lucide-react";
import { format } from "date-fns";

interface EmailJob {
    id: string;
    recipient: string;
    subject: string;
    body: string;
    scheduledTime: string;
    status: "PENDING" | "SENT" | "FAILED";
    createdAt: string;
}

export default function EmailDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [email, setEmail] = useState<EmailJob | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params.id) return;

        const fetchEmail = async () => {
            try {
                const res = await axios.get("http://localhost:4000/api/emails");
                const found = res.data.find((e: EmailJob) => e.id === params.id);
                if (found) {
                    setEmail(found);
                } else {
                    alert("Email not found");
                    router.push("/");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEmail();
    }, [params.id, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading details...</div>;
    if (!email) return null;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-semibold text-gray-900 truncate max-w-xl">{email.subject}</h1>
                    <span className="text-sm text-gray-400">|</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium tracking-wide">
                        {email.status}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <button className="p-2 hover:bg-gray-100 rounded-full hover:text-yellow-500">
                        <Star size={20} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full hover:text-red-500">
                        <Trash size={20} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full hover:text-gray-600">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-4xl w-full mx-auto p-8">
                <div className="bg-white p-8 min-h-[600px] flex flex-col">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                                {email.recipient[0].toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base font-bold text-gray-900">Me</h2>
                                    <span className="text-sm text-gray-500">&lt;sender@example.com&gt;</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                    to <span className="text-gray-900">{email.recipient}</span>
                                    <span className="text-xs">▼</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">
                                {format(new Date(email.createdAt), "MMM d, yyyy, h:mm a")}
                            </p>
                            {email.status === "PENDING" && (
                                <p className="text-xs text-emerald-600 font-medium mt-1">
                                    Scheduled for: {format(new Date(email.scheduledTime), "MMM d, h:mm a")}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="prose prose-gray max-w-none flex-1 text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {email.body}
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4">
                        <button className="flex items-center gap-2 border border-gray-300 rounded-full px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            <Reply size={16} /> Reply
                        </button>
                        <button className="flex items-center gap-2 border border-gray-300 rounded-full px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            <Forward size={16} /> Forward
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

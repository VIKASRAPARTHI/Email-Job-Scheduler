"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { ArrowLeft, Paperclip, Clock, X, Calendar, RotateCcw } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export default function ComposePage() {
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [recipient, setRecipient] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);

    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
            if (emails.length > 0) {
                setRecipient(prev => {
                    const current = prev.split(',').map(r => r.trim()).filter(r => r);
                    const newEmails = Array.from(new Set([...current, ...emails]));
                    return newEmails.join(', ');
                });
                alert(`Added ${emails.length} emails from file.`);
            } else {
                alert("No valid emails found in file.");
            }
        };
        reader.readAsText(file);
        if (csvInputRef.current) csvInputRef.current.value = "";
    };

    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [delay, setDelay] = useState(0);
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");



    const handleSend = async () => {
        try {
            let finalDelay = 0;
            if (scheduledDate && scheduledTime) {
                const target = new Date(`${scheduledDate}T${scheduledTime}`);
                finalDelay = target.getTime() - Date.now();
                if (finalDelay < 0) finalDelay = 0;
            }



            const recipients = recipient.split(',').map(r => r.trim()).filter(r => r);

            if (recipients.length === 0) {
                alert("Please add at least one recipient.");
                return;
            }

            alert(`Scheduling email to ${recipients.length} recipient(s)...`);

            for (const email of recipients) {
                const formData = new FormData();
                formData.append("recipient", email);
                formData.append("subject", subject);
                formData.append("body", body);
                formData.append("delay", String(finalDelay));

                files.forEach(file => {
                    formData.append("attachments", file);
                });

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
                await axios.post(`${apiUrl}/api/schedule`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
            }

            router.push("/");
        } catch (error) {
            const err = error as AxiosError<{ error: string }>;
            console.error(err);
            alert(`Failed to send: ${err.response?.data?.error || err.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <header className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Compose New Email</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 relative"
                    >
                        <Paperclip size={20} />
                        {files.length > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white"></span>
                        )}
                    </button>
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files) {
                                setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                            }
                        }}
                    />
                    <button
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
                        title="Schedule Send"
                    >
                        <Clock size={20} />
                    </button>
                    <button
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2"
                    >
                        Send
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-4xl w-full mx-auto p-8">
                <div className="flex flex-col min-h-[600px]">
                    <div className="flex items-center px-8 py-4 border-b border-gray-50">
                        <label className="w-20 text-sm font-medium text-gray-400">From</label>
                        <div className="flex-1 flex items-center gap-2">
                            <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                {user?.email || "guest@example.com"}
                                <span className="text-gray-400 text-xs">▼</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center px-8 py-4 border-b border-gray-50">
                        <label className="w-20 text-sm font-medium text-gray-400">To</label>
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="recipient@example.com"
                            className="flex-1 text-gray-900 placeholder-gray-300 outline-none font-medium"
                        />
                        <button
                            onClick={() => csvInputRef.current?.click()}
                            className="ml-2 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-full transition-colors font-medium"
                        >
                            Upload CSV
                        </button>
                        <input
                            type="file"
                            ref={csvInputRef}
                            className="hidden"
                            accept=".csv,.txt"
                            onChange={handleCsvUpload}
                        />
                    </div>

                    <div className="flex items-center px-8 py-4 border-b border-gray-50">
                        <label className="w-20 text-sm font-medium text-gray-400">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Subject"
                            className="flex-1 text-gray-900 placeholder-gray-300 outline-none font-medium"
                        />
                    </div>

                    {files.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-8 py-2 border-b border-gray-50 bg-gray-50/30">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-gray-700">
                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                    <button
                                        onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center px-8 py-3 border-b border-gray-50 gap-8">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-500">Delay between emails</label>
                            <input
                                type="number"
                                value={delay}
                                onChange={(e) => setDelay(Number(e.target.value))}
                                className="w-16 border rounded px-2 py-0.5 text-sm outline-emerald-500"
                                placeholder="00"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-500">Hourly Limit</label>
                            <input
                                type="number"
                                className="w-16 border rounded px-2 py-0.5 text-sm outline-emerald-500"
                                placeholder="00"
                                disabled
                            />
                        </div>
                    </div>

                    <div className="px-8 py-3 border-b border-gray-50 flex items-center gap-1 text-gray-400">
                        <button className="p-2 hover:bg-gray-100 rounded">
                            <RotateCcw size={16} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded">
                            <RotateCcw size={16} className="scale-x-[-1]" />
                        </button>
                        <div className="w-px h-4 bg-gray-200 mx-2"></div>
                        <button className="p-2 hover:bg-gray-100 rounded">
                            <span className="font-serif text-lg">T</span>
                        </button>
                        <div className="w-px h-4 bg-gray-200 mx-2"></div>
                        <button className="p-2 hover:bg-gray-100 rounded font-bold">B</button>
                        <button className="p-2 hover:bg-gray-100 rounded italic">I</button>
                        <button className="p-2 hover:bg-gray-100 rounded underline">U</button>
                    </div>

                    <div className="flex-1 p-8">
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Type Your Reply..."
                            className="w-full h-full resize-none outline-none text-gray-800 placeholder-gray-300 text-lg leading-relaxed"
                        />
                    </div>


                </div>
            </main>

            {isScheduleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Send Later</h3>
                            <button onClick={() => setIsScheduleModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pick date & time</label>
                                <div className="border border-gray-200 rounded-lg p-3 flex items-center gap-2 focus-within:ring-2 focus-within:ring-emerald-500">
                                    <Calendar size={18} className="text-gray-400" />
                                    <input
                                        type="date"
                                        className="outline-none text-sm flex-1 text-gray-700"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                    />
                                    <input
                                        type="time"
                                        className="outline-none text-sm text-gray-700"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 space-y-2">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Pick</p>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 transition-colors">
                                    Tomorrow Morning (9:00 AM)
                                </button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 transition-colors">
                                    Tomorrow Afternoon (1:00 PM)
                                </button>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button
                                onClick={() => setIsScheduleModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSend}
                                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-full shadow-sm shadow-emerald-200"
                            >
                                Schedule Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

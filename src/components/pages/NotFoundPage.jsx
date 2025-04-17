import React from "react";
import { useEffect } from "react";
import { Home } from "lucide-react";

function NotFoundPage() {
    useEffect(() => {
        document.querySelectorAll("span").forEach((span) => {
            span.remove();
        })
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
            <div className="bg-black rounded-3xl !border !border-white/10 p-16 shadow-lg flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center mb-8">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none">
                        <style>
                            {`
                                @keyframes sad {
                                    0% { stroke-dashoffset: 0; }
                                    100% { stroke-dashoffset: 200; }
                                }
                            `}
                        </style>
                        <circle cx="12" cy="12" r="7" stroke="currentColor" className="text-white/50" strokeWidth="1.5" />
                        <circle cx="9" cy="10.277" r="1" fill="currentColor" className="text-x" />
                        <circle cx="15" cy="10.277" r="1" fill="currentColor" className="text-x" />
                        <path stroke="currentColor" className="text-x" strokeLinecap="round" d="M15 15.25l-.049-.04A4.631 4.631 0 009 15.25" style={{ animation: "sad 4s infinite linear" }} strokeDasharray="100" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
                <p className="text-white/70 mb-8 text-center max-w-md">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center gap-2 !bg-x hover:!bg-x/80 !text-white !font-medium !py-3 !px-6 !rounded-xl !transition-colors"
                >
                    <Home size={18} />
                    Go to Home
                </button>
            </div>
        </div>
    );
}

export default NotFoundPage;

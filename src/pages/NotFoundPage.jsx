import React, { useEffect } from "react";
import PageLayout from "../components/layouts/PageLayout";
import { Home } from "lucide-react";

function NotFoundPage() {
  useEffect(() => {
    document.querySelectorAll("span").forEach((span) => {
      if (!span.closest("#root")) {
        span.remove();
      }
    });

    document.querySelectorAll("style").forEach((style) => {
      if (
        style.textContent.includes("Verdana") &&
        style.textContent.includes("maroon")
      ) {
        style.remove();
      }
    });
  }, []);

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-x/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none z-0"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-4">
        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-8 md:p-16 flex flex-col items-center text-center max-w-lg w-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-x/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>

          <div className="h-32 w-32 rounded-full bg-white/5 flex items-center justify-center mb-8 relative group">
            <div className="absolute inset-0 bg-x/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              fill="none"
              className="relative z-10"
            >
              <style>
                {`
                                @keyframes sad {
                                    0% { stroke-dashoffset: 0; }
                                    100% { stroke-dashoffset: 200; }
                                }
                            `}
              </style>
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#a098ff"
                className="opacity-50"
                strokeWidth="1.5"
              />
              <circle
                cx="9"
                cy="10"
                r="1.5"
                fill="currentColor"
                className="text-white"
              />
              <circle
                cx="15"
                cy="10"
                r="1.5"
                fill="currentColor"
                className="text-white"
              />
              <path
                stroke="currentColor"
                className="text-white"
                strokeLinecap="round"
                strokeWidth="1.5"
                d="M15 16c-.5.5-1.5 1-3 1s-2.5-.5-3-1"
              />
            </svg>
          </div>

          <h1
            className="!text-4xl md:!text-5xl font-black !text-white mb-4 tracking-tighter"
            style={{ fontFamily: "'Google Sans Flex', sans-serif" }}
          >
            404
          </h1>
          <h2
            className="!text-xl !font-medium !text-white/90 mb-4"
            style={{ fontFamily: "'Google Sans Flex', sans-serif" }}
          >
            Page Not Found
          </h2>

          <p
            className="!text-zinc-400 mb-10 leading-relaxed"
            style={{ fontFamily: "'Google Sans Flex', sans-serif" }}
          >
            The page you are looking for doesn't exist, has been moved, or is
            currently unavailable in the SuperFlex universe.
          </p>

          <button
            onClick={() => (window.location.href = "/")}
            className="flex items-center gap-2 bg-x hover:bg-[#8f86ff] text-white font-normal py-3.5 px-8 rounded-xl transition-all"
          >
            <Home size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </PageLayout>
  );
}

export default NotFoundPage;

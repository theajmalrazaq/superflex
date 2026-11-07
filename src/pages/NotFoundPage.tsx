import React, { useEffect } from "react";
import PageLayout from "../components/layouts/PageLayout";
import { FileQuestion, Home } from "lucide-react";
import Button from "../components/ui/Button";

const NotFoundPage = () => {
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("span").forEach((span) => {
      if (!span.closest("#react-chrome-app")) {
        span.remove();
      }
    });

    document.querySelectorAll<HTMLElement>("style").forEach((style) => {
      if (style.textContent.includes("Verdana") && style.textContent.includes("maroon")) {
        style.remove();
      }
    });
  }, []);

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-6 space-y-8 animate-in fade-in duration-700 font-sans">
        <div className="relative z-10 text-center space-y-6 max-w-lg">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <FileQuestion size={40} className="text-rose-500 animate-pulse" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl !font-bold !text-foreground">Page Not Found</h1>
            <p className="!text-foreground/50 text-sm leading-relaxed">
              Bhai, tu kahan aa gaya? This page doesn't exist. Just like your semester break.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button
              onClick={() => (window.location.href = "/")}
              variant="primary"
              icon={<Home size={18} />}
              className="w-full sm:w-auto min-w-[200px] !text-foreground"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFoundPage;

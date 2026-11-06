import React, { useEffect } from "react";
import { ShieldAlert, ArrowRight, Home } from "lucide-react";
import Button from "../components/ui/Button";

const SessionExpirePage = () => {
  useEffect(() => {
    document.body.style.backgroundColor = "black";
    document.body.removeAttribute("bgcolor");
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in duration-700 font-sans">
      <style>{`#react-chrome-app, #react-chrome-app * { font-family: 'Google Sans Flex', sans-serif !important; }`}</style>

      <div className="relative z-10 text-center space-y-6 max-w-lg">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <ShieldAlert size={40} className="text-rose-500 animate-pulse" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl !font-bold !text-foreground">
            Session Expired
          </h1>
          <p className="!text-foreground/50 text-sm leading-relaxed">
            Even FLEX needs a break. Sign back in, the ragra isn't over.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Button
            onClick={() => (window.location.href = "/Login")}
            variant="primary"
            icon={<ArrowRight size={18} />}
            className="w-full !text-foreground"
          >
            Log In Again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="secondary"
            icon={<Home size={18} />}
            className="w-full"
          >
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpirePage;

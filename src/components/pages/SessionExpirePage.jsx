import React, { useEffect } from "react";
import { ShieldAlert, ArrowRight, Home } from "lucide-react";

const ActionBtn = ({ onClick, primary, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-bold transition-all duration-300 ${
      primary
        ? "bg-[#a098ff] hover:bg-[#8f86ff] !text-white"
        : "bg-white/5 hover:bg-white/10 !text-white border border-white/5"
    }`}
  >
    <span className="text-sm">{children}</span>
    {Icon && <Icon size={18} className={!primary ? "text-zinc-400" : ""} />}
  </button>
);

const SessionExpirePage = () => {
  useEffect(() => {
    document.body.style.backgroundColor = "black";
    document.body.removeAttribute("bgcolor");
    window.dispatchEvent(
      new CustomEvent("superflex-update-loading", { detail: false }),
    );
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in duration-700 font-sans">
      <style>{`#react-chrome-app, #react-chrome-app * { font-family: 'Google Sans Flex', sans-serif !important; }`}</style>

      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("${chrome.runtime.getURL("overlay.png")}")`,
        }}
      />

      <div className="relative z-10 text-center space-y-6 max-w-lg">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <ShieldAlert size={40} className="text-rose-500 animate-pulse" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black !text-white">
            Session <span className="!text-rose-500">Expired</span>
          </h1>
          <p className="!text-zinc-500 text-sm leading-relaxed">
            Your session timed out. Please sign in again to continue.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <ActionBtn
            onClick={() => (window.location.href = "/Login")}
            primary
            icon={ArrowRight}
          >
            Log In Again
          </ActionBtn>
          <ActionBtn onClick={() => (window.location.href = "/")} icon={Home}>
            Home
          </ActionBtn>
        </div>
      </div>
    </div>
  );
};

export default SessionExpirePage;

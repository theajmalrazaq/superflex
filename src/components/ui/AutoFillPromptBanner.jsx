import React, { useEffect, useState } from "react";
import { KeyRound, ShieldCheck, X, Check, Lock } from "lucide-react";
import {
  getPendingLogin,
  saveCredentials,
  hasSavedCredentials,
  isAutofillPromptDismissed,
  dismissAutofillPrompt,
} from "../../utils/credentialStorage";

export default function AutoFillPromptBanner() {
  const [pending, setPending] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function checkPrompt() {
      if (isAutofillPromptDismissed()) return;
      const alreadySaved = await hasSavedCredentials();
      if (alreadySaved) return;

      const pendingLogin = getPendingLogin();
      if (pendingLogin && pendingLogin.username && pendingLogin.password) {
        setPending(pendingLogin);
        setVisible(true);
      }
    }
    checkPrompt();
  }, []);

  if (!visible || !pending) return null;

  const handleEnable = async () => {
    setSaving(true);
    const ok = await saveCredentials(pending.username, pending.password);
    setSaving(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setVisible(false);
      }, 3500);
    }
  };

  const handleDismiss = (forever = false) => {
    dismissAutofillPrompt(forever);
    setVisible(false);
  };

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-black/[0.08] bg-white/95 p-5 shadow-xs backdrop-blur-md transition-all dark:border-white/[0.14] dark:bg-black/90 dark:text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]">
            {success ? <Check size={20} strokeWidth={3} /> : <KeyRound size={20} />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold tracking-tight text-foreground">
                {success ? "Auto-Fill Enabled!" : "Remember Login on This Device?"}
              </h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <Lock size={10} />
                AES-GCM Encrypted
              </span>
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed max-w-xl">
              {success
                ? "Your Roll No and password have been encrypted in local extension storage. SuperFlex will auto-fill them next time your session expires."
                : `Would you like SuperFlex to remember your credentials for ${pending.username}? You won't have to re-enter them every time FLEX logs you out.`}
            </p>
          </div>
        </div>

        {!success && (
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handleEnable}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full bg-[#230052] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#370c72] active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-[#0a192f] dark:hover:bg-white/80"
            >
              <ShieldCheck size={14} />
              {saving ? "Encrypting..." : "Enable Auto-Fill"}
            </button>
            <button
              type="button"
              onClick={() => handleDismiss(false)}
              className="rounded-full px-3 py-2 text-xs font-semibold text-foreground/60 hover:text-foreground transition-colors"
            >
              Not Now
            </button>
            <button
              type="button"
              onClick={() => handleDismiss(true)}
              className="rounded-full p-2 text-foreground/40 hover:text-foreground transition-colors"
              title="Don't ask again"
              aria-label="Dismiss auto-fill prompt"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

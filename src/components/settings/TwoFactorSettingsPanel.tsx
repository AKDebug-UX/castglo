import { useState } from "react";
import {
  ShieldCheck, ShieldOff, QrCode, KeyRound, Copy, Download,
  AlertTriangle, Loader2, Eye, EyeOff, CheckCircle2, RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ── Backup Codes Display ─────────────────────────────────────────────────────
interface BackupCodesDisplayProps {
  codes: string[];
  onClose: () => void;
}

function BackupCodesDisplay({ codes, onClose }: BackupCodesDisplayProps) {
  const [saved, setSaved] = useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(codes.join("\n")).then(() => {
      toast.success("Backup codes copied to clipboard");
    });
  };

  const handleDownload = () => {
    const blob = new Blob(
      [`Castglo 2FA Backup Codes\nGenerated: ${new Date().toISOString()}\n\n${codes.join("\n")}\n`],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "castglo-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Save these backup codes somewhere safe. Each code can be used once to log in if you lose access to your authenticator app.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 rounded-xl border font-mono text-sm">
        {codes.map((c) => (
          <div key={c} className="px-3 py-2 bg-white rounded-lg border text-center tracking-widest font-semibold text-slate-800 select-all">
            {c}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 rounded-xl gap-2 font-semibold"
          onClick={handleCopyAll}
        >
          <Copy className="w-4 h-4" /> Copy all
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 rounded-xl gap-2 font-semibold"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4" /> Download
        </Button>
      </div>

      <label className="flex items-start gap-3 cursor-pointer select-none group">
        <div
          role="checkbox"
          aria-checked={saved}
          tabIndex={0}
          id="backup-codes-saved-check"
          onClick={() => setSaved(!saved)}
          onKeyDown={(e) => e.key === " " && setSaved(!saved)}
          className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 transition-colors flex items-center justify-center cursor-pointer
            ${saved ? "bg-[#009698] border-[#009698]" : "border-slate-300 group-hover:border-[#009698]"}`}
        >
          {saved && <CheckCircle2 className="w-3 h-3 text-white" />}
        </div>
        <span className="text-sm text-slate-700 leading-snug">
          I have saved these backup codes in a safe location. I understand they will not be shown again.
        </span>
      </label>

      <Button
        id="backup-codes-done-btn"
        className="w-full bg-[#009698] hover:bg-[#009698]/90 font-bold rounded-xl text-white"
        disabled={!saved}
        onClick={onClose}
      >
        Done
      </Button>
    </div>
  );
}

// ── 2FA Setup Modal (Enrol → Confirm → Backup Codes) ─────────────────────────
interface SetupModalProps {
  open: boolean;
  onClose: () => void;
}

type SetupStep = "enrol" | "confirm" | "backup";

function TwoFactorSetupModal({ open, onClose }: SetupModalProps) {
  const { enrolTwoFactor, confirmTwoFactor } = useAuth();
  const [step, setStep] = useState<SetupStep>("enrol");
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showSecret, setShowSecret] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpen = async () => {
    setStep("enrol");
    setCode("");
    setErrorMsg(null);
    setIsLoading(true);
    const result = await enrolTwoFactor();
    setIsLoading(false);
    if (result.error) {
      toast.error(result.error);
      onClose();
      return;
    }
    setQrCode(result.qrCode || null);
    setSecret(result.secret || null);
  };

  const handleConfirm = async () => {
    if (!code.trim()) {
      setErrorMsg("Please enter the code from your authenticator app.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    const result = await confirmTwoFactor(code.trim());
    setIsLoading(false);
    if (result.error) {
      setErrorMsg(result.error);
      setCode("");
      return;
    }
    setBackupCodes(result.backupCodes || []);
    setStep("backup");
  };

  const handleClose = () => {
    setStep("enrol");
    setQrCode(null);
    setSecret(null);
    setCode("");
    setBackupCodes([]);
    setErrorMsg(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else handleOpen(); }}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="w-5 h-5 text-[#009698]" />
            {step === "enrol" && "Set up two-factor authentication"}
            {step === "confirm" && "Confirm your authenticator"}
            {step === "backup" && "Your backup codes"}
          </DialogTitle>
          <DialogDescription>
            {step === "enrol" && "Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)."}
            {step === "confirm" && "Enter the 6-digit code shown in your authenticator app to confirm setup."}
            {step === "backup" && "Store these codes safely — they're your recovery option if you lose your device."}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: QR Code */}
        {step === "enrol" && (
          <div className="space-y-5 py-2">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#009698]" />
              </div>
            ) : (
              <>
                {qrCode && (
                  <div className="flex justify-center">
                    <div className="p-3 bg-white border rounded-xl shadow-sm inline-block">
                      <img src={qrCode} alt="2FA QR code" className="w-48 h-48" />
                    </div>
                  </div>
                )}
                {secret && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Manual setup key
                    </p>
                    <div className="flex items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2">
                      <code className="flex-1 font-mono text-sm text-slate-800 tracking-widest break-all">
                        {showSecret ? secret : "•".repeat(secret.length)}
                      </code>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          navigator.clipboard.writeText(secret);
                          toast.success("Secret key copied");
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button
                    className="w-full bg-[#009698] hover:bg-[#009698]/90 font-bold rounded-xl text-white"
                    onClick={() => setStep("confirm")}
                  >
                    Next — Enter code
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        )}

        {/* Step 2: Confirm code */}
        {step === "confirm" && (
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Authenticator code</label>
              <Input
                id="2fa-setup-code-input"
                type="text"
                inputMode="numeric"
                autoFocus
                placeholder="000000"
                value={code}
                onChange={(e) => { setCode(e.target.value); setErrorMsg(null); }}
                disabled={isLoading}
                className="text-center text-lg tracking-widest font-mono rounded-xl h-12"
                maxLength={8}
              />
              {errorMsg && (
                <p className="text-xs font-medium text-destructive flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> {errorMsg}
                </p>
              )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setStep("enrol")}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                id="2fa-setup-confirm-btn"
                className="flex-1 bg-[#009698] hover:bg-[#009698]/90 font-bold rounded-xl text-white"
                onClick={handleConfirm}
                disabled={isLoading || !code.trim()}
              >
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</> : "Confirm setup"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 3: Backup Codes */}
        {step === "backup" && (
          <BackupCodesDisplay codes={backupCodes} onClose={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main Settings Panel ───────────────────────────────────────────────────────
export function TwoFactorSettingsPanel() {
  const { user, disableTwoFactor, regenerateBackupCodes } = useAuth();
  const enabled = user?.twoFactorEnabled ?? false;

  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenCodes, setRegenCodes] = useState<string[] | null>(null);

  const handleDisable = async () => {
    if (!disablePassword) {
      toast.error("Password is required");
      return;
    }
    setIsDisabling(true);
    const result = await disableTwoFactor(disablePassword);
    setIsDisabling(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Two-factor authentication disabled.");
    setShowDisable(false);
    setDisablePassword("");
  };

  const handleRegenerate = async () => {
    setShowRegenConfirm(false);
    setIsRegenerating(true);
    const result = await regenerateBackupCodes();
    setIsRegenerating(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setRegenCodes(result.backupCodes || []);
  };

  return (
    <>
      <div className="flex items-start justify-between p-5 rounded-2xl border bg-slate-50/50 gap-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${enabled ? "bg-emerald-100" : "bg-slate-100"}`}>
            {enabled
              ? <ShieldCheck className="w-5 h-5 text-emerald-600" />
              : <ShieldOff className="w-5 h-5 text-slate-500" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-800">Authenticator app (TOTP)</p>
              {enabled
                ? <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold rounded-full px-2">Enabled</Badge>
                : <Badge variant="outline" className="text-slate-500 text-[10px] font-bold rounded-full px-2">Not set up</Badge>}
            </div>
            <p className="text-xs text-muted-foreground leading-snug">
              {enabled
                ? "Your account is protected with a TOTP authenticator app."
                : "Protect your account with an authenticator app like Google Authenticator or Authy."}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          {enabled ? (
            <>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl text-xs font-bold gap-1.5 whitespace-nowrap"
                onClick={() => setShowRegenConfirm(true)}
                disabled={isRegenerating}
              >
                {isRegenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                Backup codes
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="rounded-xl text-xs font-bold"
                onClick={() => setShowDisable(true)}
              >
                Disable 2FA
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="bg-[#009698] hover:bg-[#009698]/90 rounded-xl text-xs font-bold text-white gap-1.5 whitespace-nowrap"
              onClick={() => setShowSetup(true)}
            >
              <QrCode className="w-3.5 h-3.5" /> Set up 2FA
            </Button>
          )}
        </div>
      </div>

      {/* Setup modal */}
      <TwoFactorSetupModal open={showSetup} onClose={() => setShowSetup(false)} />

      {/* Disable 2FA dialog */}
      <Dialog open={showDisable} onOpenChange={(v) => { if (!v) { setShowDisable(false); setDisablePassword(""); } }}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-destructive" />
              Disable two-factor authentication
            </DialogTitle>
            <DialogDescription>
              Enter your account password to disable 2FA. This will make your account less secure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-sm font-medium text-slate-700">Current password</label>
            <div className="relative">
              <Input
                id="disable-2fa-password-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="rounded-xl pr-10"
                disabled={isDisabling}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => { setShowDisable(false); setDisablePassword(""); }}
              disabled={isDisabling}
            >
              Cancel
            </Button>
            <Button
              id="disable-2fa-confirm-btn"
              variant="destructive"
              className="rounded-xl font-bold"
              onClick={handleDisable}
              disabled={isDisabling || !disablePassword}
            >
              {isDisabling ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Disabling...</> : "Disable 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regen confirm dialog */}
      <AlertDialog open={showRegenConfirm} onOpenChange={setShowRegenConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate backup codes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your existing backup codes will be permanently invalidated. New codes will be generated. Make sure to save them immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              id="regen-backup-codes-confirm-btn"
              className="rounded-xl font-bold bg-[#009698] hover:bg-[#009698]/90 text-white"
              onClick={handleRegenerate}
            >
              Regenerate codes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Show new backup codes after regen */}
      <Dialog open={!!regenCodes} onOpenChange={(v) => { if (!v) setRegenCodes(null); }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-[#009698]" />
              New backup codes
            </DialogTitle>
            <DialogDescription>
              Your old codes have been invalidated. Save these new codes now.
            </DialogDescription>
          </DialogHeader>
          {regenCodes && (
            <BackupCodesDisplay codes={regenCodes} onClose={() => setRegenCodes(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

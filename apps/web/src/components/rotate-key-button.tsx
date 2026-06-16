"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { rotateKeyAction } from "@/lib/actions/profile";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import { Copy, Check, RefreshCw } from "lucide-react";

export function RotateKeyButton() {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRotate = async () => {
    setLoading(true);
    setError(null);
    const result = await rotateKeyAction();
    setLoading(false);
    setConfirmOpen(false);

    if (result.error) {
      setError(result.error);
    } else if (result.newApiKey) {
      setNewKey(result.newApiKey);
      setOpen(true);
    }
  };

  const copyToClipboard = async () => {
    if (newKey) {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("rotateButton")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rotateConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("rotateConfirmDescription")}
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{t(error)}</p>}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              {tc("cancel")}
            </Button>
            <Button onClick={handleRotate} disabled={loading}>
              {loading ? t("rotating") : t("rotateSubmit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("newKeyTitle")}</DialogTitle>
            <DialogDescription>
              {t("newKeyDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input value={newKey || ""} readOnly className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>{tc("done")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

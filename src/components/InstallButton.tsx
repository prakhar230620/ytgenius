"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import usePwaInstall from "@/hooks/use-pwa-install";

interface InstallButtonProps {
  className?: string;
}

export default function InstallButton({ className }: InstallButtonProps) {
  const { isInstallable, promptInstall } = usePwaInstall();

  if (!isInstallable) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => promptInstall()}
    >
      <Download className="mr-2 h-4 w-4" />
      ऐप इंस्टॉल करें
    </Button>
  );
}
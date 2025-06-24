"use client";

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import usePwaUpdate from "@/hooks/use-pwa-update";

export default function UpdatePrompt() {
  const { updateAvailable, applyUpdate } = usePwaUpdate();
  const { toast } = useToast();

  useEffect(() => {
    if (updateAvailable) {
      toast({
        title: "New update available",
        description: "Update for a better experience",
        action: (
          <Button variant="outline" size="sm" onClick={applyUpdate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Update
          </Button>
        ),
        duration: 0, // Don't auto-dismiss
      });
    }
  }, [updateAvailable, toast, applyUpdate]);

  return null; // This component doesn't render anything directly
}
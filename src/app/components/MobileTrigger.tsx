"use client";

import { PanelLeft } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function MobileTrigger() {
  const { toggleSidebar, openMobile } = useSidebar();

  if (openMobile) return null;

  return (
    <Button
      variant="secondary"
      size="icon"
      className="md:hidden fixed left-0 top-72 -translate-y-72 z-40 h-10 w-6 rounded-l-none rounded-r-full border-y border-r shadow-md bg-background/80 backdrop-blur-sm opacity-70 hover:opacity-100 transition-all"
      onClick={() => toggleSidebar()}
    >
      <PanelLeft className="h-3 w-3" />
    </Button>
  );
}

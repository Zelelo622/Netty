"use client";

import { MoveUpLeft } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { useChat } from "@/context/ChatContext";
import { HeaderChat } from "@/features/chat/components/HeaderChat";
import { cn } from "@/lib/utils";

export function ChatWindow() {
  const { isOpen, closeChat } = useChat();

  const [size, setSize] = useState({ width: 550, height: 450 });
  const [isHoveringResize, setIsHoveringResize] = useState(false);
  const isResizing = useRef(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const calculatedWidth = viewportWidth - e.clientX - 40;
    const constrainedWidth = Math.max(450, Math.min(calculatedWidth, viewportWidth - 320));

    const calculatedHeight = viewportHeight - e.clientY;
    const constrainedHeight = Math.max(350, Math.min(calculatedHeight, viewportHeight - 84));

    setSize({
      width: constrainedWidth,
      height: constrainedHeight,
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-0 right-0 sm:right-10 z-40 px-4 sm:px-0"
      style={{ width: size.width, height: size.height }}
    >
      <div
        onMouseDown={startResizing}
        onMouseEnter={() => setIsHoveringResize(true)}
        onMouseLeave={() => setIsHoveringResize(false)}
        className="absolute -top-1 -left-1 w-5 h-5 cursor-nwse-resize z-50 transition-color hover:bg-primary/10 rounded-tl-lg"
      >
        {isHoveringResize && (
          <MoveUpLeft
            className={cn(
              "h-4 w-4 transition-opacity",
              isHoveringResize || isResizing.current ? "opacity-100" : "opacity-0"
            )}
          />
        )}
      </div>
      <Card className="flex flex-col h-full shadow-2xl border-b-0 rounded-b-none overflow-hidden animate-in slide-in-from-bottom-5 duration-300 py-1">
        <div className="flex justify-between items-center">
          <div>левая часть</div>
          <HeaderChat />
        </div>
      </Card>
    </div>
  );
}

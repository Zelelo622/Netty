"use client";

import { MoveUpLeft } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { useChat } from "@/context/ChatContext";
import { HeaderChat } from "@/features/chat/components/HeaderChat";
import { HeaderSettings } from "@/features/chat/components/HeaderSettings";
import { InputChat } from "@/features/chat/components/InputChat";
import { cn } from "@/lib/utils";

export function ChatWindow() {
  const { isOpen, closeChat } = useChat();

  const [size, setSize] = useState({ width: 780, height: 680 });
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
    const constrainedWidth = Math.max(780, Math.min(calculatedWidth, viewportWidth - 320));

    const calculatedHeight = viewportHeight - e.clientY;
    const constrainedHeight = Math.max(680, Math.min(calculatedHeight, viewportHeight - 84));

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
        className="absolute -top-1 -left-1 w-5 h-5 cursor-nwse-resize z-50 transition-color hover:bg-accent/50 rounded-tl-lg"
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
      <Card className="flex flex-col h-full shadow-2xl border rounded-br-none overflow-hidden animate-in slide-in-from-bottom-5 duration-300 p-0">
        <div className="grid h-full grid-cols-[30%_1fr] min-w-0">
          {/* Левая панель */}
          <div className="flex flex-col border-r bg-muted/20 min-w-[min(500px,30%)]">
            <HeaderSettings />
            <div className="flex-1 overflow-y-auto p-4 bg-background/95">
              <div>Чат</div>
              <div>Чат</div>
              <div>Чат</div>
              <div>Чат</div>
            </div>
          </div>

          {/* Правая панель — чат */}
          <div className="flex flex-col min-w-0">
            <HeaderChat />

            <div className="flex-1 overflow-y-auto bg-background/95">{/* сообщения */}</div>
            <div className="bg-background/95">
              <InputChat />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

"use client";

import { Timestamp } from "firebase/firestore";
import { MoveUpLeft } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { ChatItem } from "@/features/chat/components/ChatItem";
import { HeaderChat } from "@/features/chat/components/HeaderChat";
import { HeaderSettings } from "@/features/chat/components/HeaderSettings";
import { InputChat } from "@/features/chat/components/InputChat";
import { MessageBubble } from "@/features/chat/components/MessageBubble";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useMessages } from "@/hooks/useMessages";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ChatService, getConvId } from "@/services/chat.service";
import { IMessage } from "@/types/types";

export function ChatWindow() {
  const { isOpen, activeParticipantId, openChatWith } = useChat();
  const { user } = useAuth();

  const [size, setSize] = useState({ width: 780, height: 680 });
  const [isHoveringResize, setIsHoveringResize] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<IMessage[]>([]);
  const isResizing = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const convId = user && activeParticipantId ? getConvId(user.uid, activeParticipantId) : null;

  const { messages } = useMessages(convId);
  const { users } = useAllUsers(user?.uid);
  const { profile: otherProfile } = useUserProfile(activeParticipantId ?? undefined);

  useEffect(() => {
    setOptimisticMessages([]);
  }, [messages]);

  // Автоскролл
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, optimisticMessages]);

  // markAsRead при смене активного чата
  useEffect(() => {
    if (convId && user) {
      ChatService.markAsRead(convId, user.uid).catch(() => {});
    }
  }, [convId, user]);

  const handleSend = useCallback(
    async (text: string): Promise<void> => {
      if (!user || !activeParticipantId) return;

      const cid = getConvId(user.uid, activeParticipantId);

      // Оптимистичное сообщение — показываем сразу
      const tempId = `temp_${Date.now()}`;
      const optimistic: IMessage = {
        id: tempId,
        text,
        senderId: user.uid,
        createdAt: Timestamp.now(),
        isPending: true,
      };
      setOptimisticMessages((prev) => [...prev, optimistic]);

      try {
        await ChatService.getOrCreateConversation(user.uid, activeParticipantId);
        await ChatService.sendMessage(cid, user.uid, activeParticipantId, text);
        // onSnapshot сам обновит messages и useEffect уберёт optimistic
      } catch (err) {
        console.error("[ChatWindow] handleSend error:", err);
        // Помечаем как failed
        setOptimisticMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, isPending: false, isFailed: true } : m))
        );
        throw err; // пробрасываем чтобы InputChat мог вернуть текст
      }
    },
    [user, activeParticipantId]
  );

  // --- resize ---
  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setSize({
      width: Math.max(640, Math.min(vw - e.clientX - 40, vw - 320)),
      height: Math.max(520, Math.min(vh - e.clientY, vh - 84)),
    });
  }, []);

  const startResizing = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isResizing.current = true;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", stopResizing);
    },
    [handleMouseMove, stopResizing]
  );

  if (!isOpen) return null;

  // Сливаем реальные + оптимистичные, исключая дубли
  const realIds = new Set(messages.map((m) => m.id));
  const visibleMessages = [...messages, ...optimisticMessages.filter((m) => !realIds.has(m.id))];

  return (
    <div
      className="fixed bottom-0 right-0 sm:right-10 z-40 px-4 sm:px-0"
      style={{ width: size.width, height: size.height }}
    >
      <div
        onMouseDown={startResizing}
        onMouseEnter={() => setIsHoveringResize(true)}
        onMouseLeave={() => setIsHoveringResize(false)}
        className="absolute -top-1 -left-1 w-5 h-5 cursor-nwse-resize z-50 transition-colors hover:bg-accent/50 rounded-tl-lg"
      >
        {isHoveringResize && <MoveUpLeft className="h-4 w-4 opacity-100" />}
      </div>

      <Card className="flex flex-col h-full shadow-2xl border rounded-br-none overflow-hidden animate-in slide-in-from-bottom-5 duration-300 p-0">
        <div className="grid h-full grid-cols-[280px_1fr] min-w-0 overflow-hidden">
          {/* Левая панель */}
          <div className="flex flex-col border-r bg-muted/20 overflow-hidden">
            <HeaderSettings />
            <div className="flex-1 overflow-y-auto p-2 bg-background/95">
              {users.map((u) => (
                <ChatItem
                  key={u.uid}
                  id={u.uid}
                  name={u.displayName}
                  avatar={u.photoURL}
                  lastMessage=""
                  lastMessageTime=""
                  isActive={activeParticipantId === u.uid}
                  onClick={() => openChatWith(u.uid)}
                />
              ))}
            </div>
          </div>

          {/* Правая панель */}
          <div className="flex flex-col min-w-0 overflow-hidden">
            <HeaderChat />

            <div className="flex-1 overflow-y-auto bg-background/95 px-3 py-2">
              {!activeParticipantId ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Выберите собеседника слева
                </div>
              ) : visibleMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Нет сообщений. Напишите первым!
                </div>
              ) : (
                visibleMessages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    currentUserId={user?.uid ?? ""}
                    otherAvatar={otherProfile?.photoURL}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-background/95 border-t">
              <InputChat onSend={handleSend} disabled={!activeParticipantId} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

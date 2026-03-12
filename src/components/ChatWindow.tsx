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
import { useUserConversations } from "@/hooks/useUserConversations";
import { formatTime } from "@/lib/utils";
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
  const convExistsRef = useRef(false);
  const sendQueue = useRef<Promise<void>>(Promise.resolve());

  const convId = user && activeParticipantId ? getConvId(user.uid, activeParticipantId) : null;

  const { messages } = useMessages(convId);
  const { users } = useAllUsers(user?.uid);
  const { conversations } = useUserConversations(user?.uid);
  const activeOtherUser = users.find((u) => u.uid === activeParticipantId);

  useEffect(() => {
    convExistsRef.current = false;
    setOptimisticMessages([]);
  }, [activeParticipantId]);

  useEffect(() => {
    setOptimisticMessages([]);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, optimisticMessages]);

  useEffect(() => {
    if (!convId || !user || messages.length === 0) return;

    const unreadFromOther = messages.filter((m) => m.senderId !== user.uid && m.read === false);

    if (unreadFromOther.length > 0) {
      ChatService.markAsRead(convId, user.uid);
    }
  }, [messages, convId, user]);

  const handleSend = useCallback(
    async (text: string): Promise<void> => {
      if (!user || !activeParticipantId) return;
      const cid = getConvId(user.uid, activeParticipantId);

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const optimistic: IMessage = {
        id: tempId,
        text,
        senderId: user.uid,
        createdAt: Timestamp.now(),
        isPending: true,
        read: false,
      };
      setOptimisticMessages((prev) => [...prev, optimistic]);

      sendQueue.current = sendQueue.current
        .then(async () => {
          await ChatService.getOrCreateConversation(user.uid, activeParticipantId);
          convExistsRef.current = true;
          await ChatService.sendMessage(cid, user.uid, activeParticipantId, text);
        })
        .catch((err) => {
          console.error("Ошибка в очереди отправки:", err);
          setOptimisticMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, isPending: false, isFailed: true } : m))
          );
        });
    },
    [user, activeParticipantId]
  );

  useEffect(() => {
    if (messages.length > 0) {
      convExistsRef.current = true;
    }
  }, [messages]);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    setSize({
      width: Math.max(640, Math.min(window.innerWidth - e.clientX - 40, window.innerWidth - 320)),
      height: Math.max(520, Math.min(window.innerHeight - e.clientY, window.innerHeight - 84)),
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
          <div className="flex flex-col border-r bg-muted/20 overflow-hidden">
            <HeaderSettings />
            <div className="flex-1 overflow-y-auto p-2 bg-background/95">
              {users.map((u) => {
                const cid = getConvId(user?.uid || "", u.uid);
                const conv = conversations.find((c) => c.id === cid);
                const unread = conv?.unreadCount?.[user?.uid || ""] || 0;

                return (
                  <ChatItem
                    key={u.uid}
                    id={u.uid}
                    name={u.displayName}
                    avatar={u.photoURL}
                    lastMessage={conv?.lastMessagePreview || ""}
                    lastMessageTime={conv?.lastMessageAt ? formatTime(conv.lastMessageAt) : ""}
                    unreadCount={unread}
                    isActive={activeParticipantId === u.uid}
                    onClick={() => openChatWith(u.uid)}
                  />
                );
              })}
            </div>
          </div>

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
                    otherAvatar={activeOtherUser?.photoURL}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-background/95 border-t">
              {activeParticipantId && (
                <InputChat onSend={handleSend} disabled={!activeParticipantId} />
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

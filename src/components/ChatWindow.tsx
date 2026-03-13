"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { Timestamp } from "firebase/firestore";
import { Loader2, MoveUpLeft } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

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

import { Button } from "./ui/button";

export function ChatWindow() {
  const { isOpen, activeParticipantId, openChatWith } = useChat();
  const { user } = useAuth();

  const [size, setSize] = useState({ width: 780, height: 680 });
  const [isHoveringResize, setIsHoveringResize] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<IMessage[]>([]);
  const [editingMessage, setEditingMessage] = useState<IMessage | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isResizing = useRef(false);
  const sendQueue = useRef<Promise<void>>(Promise.resolve());

  const [localConvIds, setLocalConvIds] = useState<Set<string>>(() => new Set());

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const prevScrollHeightRef = useRef(0);
  const isPrependingRef = useRef(false);
  const didInitialScrollRef = useRef(false);

  const convId = user && activeParticipantId ? getConvId(user.uid, activeParticipantId) : null;

  const { conversations } = useUserConversations(user?.uid);
  const convExists =
    conversations.some((c) => c.id === convId) || (!!convId && localConvIds.has(convId));
  const { messages, loading, loadingMore, hasMore, loadMore } = useMessages(
    convExists ? convId : null
  );
  const { users } = useAllUsers(user?.uid);
  const activeOtherUser = users.find((u) => u.uid === activeParticipantId);
  const filteredUsers = users.filter((user) =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const realIds = new Set(messages.map((m) => m.id));
  const visibleMessages: IMessage[] = [
    ...messages,
    ...optimisticMessages.filter((m) => !realIds.has(m.id)),
  ];

  const virtualizer = useVirtualizer({
    count: visibleMessages.length,
    getScrollElement: () => messagesContainerRef.current,
    estimateSize: () => 72,
    overscan: 10,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  const scrollToBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    setOptimisticMessages([]);
    isNearBottomRef.current = true;
    didInitialScrollRef.current = false;
    isPrependingRef.current = false;
  }, [activeParticipantId]);

  useEffect(() => {
    if (messages.length > 0) {
      setOptimisticMessages((prev) => prev.filter((m) => m.isFailed));
    }
  }, [messages]);

  useLayoutEffect(() => {
    if (loading || didInitialScrollRef.current || visibleMessages.length === 0) return;
    scrollToBottom();
    didInitialScrollRef.current = true;
  });

  const prevCountRef = useRef(0);
  useLayoutEffect(() => {
    const count = visibleMessages.length;
    const grew = count > prevCountRef.current;
    prevCountRef.current = count;

    if (!grew || isPrependingRef.current) return;
    if (isNearBottomRef.current) scrollToBottom();
  }, [visibleMessages.length, scrollToBottom]);

  useLayoutEffect(() => {
    if (!isPrependingRef.current) return;
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
    isPrependingRef.current = false;
  }, [messages.length]);

  useEffect(() => {
    if (!convId || !user || messages.length === 0) return;
    const unread = messages.filter((m) => m.senderId !== user.uid && !m.read);
    if (unread.length > 0) ChatService.markAsRead(convId, user.uid);
  }, [messages, convId, user]);

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;

    if (el.scrollTop < 80 && hasMore && !loadingMore) {
      prevScrollHeightRef.current = el.scrollHeight;
      isPrependingRef.current = true;
      loadMore();
    }
  }, [loadMore, loadingMore, hasMore]);

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

      isNearBottomRef.current = true;
      setOptimisticMessages((prev) => [...prev, optimistic]);

      sendQueue.current = sendQueue.current
        .then(async () => {
          await ChatService.getOrCreateConversation(user.uid, activeParticipantId);
          setLocalConvIds((prev) => new Set(prev).add(cid));
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

  const handleSendOrEdit = useCallback(
    async (text: string): Promise<void> => {
      if (editingMessage) {
        await ChatService.editMessage(convId!, editingMessage.id, text);
        setEditingMessage(null);
        return;
      }
      await handleSend(text);
    },
    [editingMessage, convId, handleSend]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    if (!user) return;

    const unreadConvs = conversations.filter((c) => (c.unreadCount?.[user.uid] || 0) > 0);
    if (unreadConvs.length === 0) return;
    await ChatService.markAllAsRead(user.uid, unreadConvs);
  }, [user, conversations]);

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
            <HeaderSettings
              onMarkReadAllChats={handleMarkAllAsRead}
              onNewChat={() => {
                setIsSearching(true);
                setSearchQuery("");
              }}
            />
            {isSearching ? (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-2">
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск пользователей..."
                    className="w-full px-3 py-1.5 text-sm rounded-md border bg-background outline-none focus:ring-1 focus:ring-ring"
                  />
                  <Button
                    className="cursor-pointer my-1"
                    onClick={() => setIsSearching(false)}
                    size={"xs"}
                    variant={"ghost"}
                  >
                    ← Назад
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 bg-background/95">
                  {(searchQuery.trim() === ""
                    ? [...users].sort(() => Math.random() - 0.5).slice(0, 3)
                    : filteredUsers
                  ).map((u) => (
                    <ChatItem
                      key={u.uid}
                      id={u.uid}
                      name={u.displayName}
                      avatar={u.photoURL}
                      lastMessage=""
                      lastMessageTime=""
                      unreadCount={0}
                      isActive={activeParticipantId === u.uid}
                      onClick={() => {
                        openChatWith(u.uid);
                        setIsSearching(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-2 bg-background/95">
                {users
                  .filter((u) => {
                    const cid = getConvId(user?.uid || "", u.uid);
                    return conversations.some((c) => c.id === cid) || localConvIds.has(cid);
                  })
                  .map((u) => {
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
            )}
          </div>

          <div className="flex flex-col min-w-0 overflow-hidden">
            <HeaderChat />

            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto bg-background/95 px-3 py-2"
            >
              {loadingMore && (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {!hasMore && messages.length > 0 && (
                <div className="text-center text-xs text-muted-foreground py-2 select-none">
                  Начало переписки
                </div>
              )}

              {!activeParticipantId ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Выберите собеседника слева
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : visibleMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Нет сообщений. Напишите первым!
                </div>
              ) : (
                <div
                  style={{
                    height: virtualizer.getTotalSize(),
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualRow) => {
                    const msg = visibleMessages[virtualRow.index];
                    return (
                      <div
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={virtualizer.measureElement}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <MessageBubble
                          message={msg}
                          currentUserId={user?.uid ?? ""}
                          otherAvatar={activeOtherUser?.photoURL}
                          convId={convId!}
                          onEdit={(msg) => setEditingMessage(msg)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-background/95 border-t">
              {activeParticipantId && (
                <InputChat
                  onSend={handleSendOrEdit}
                  disabled={!activeParticipantId}
                  editingMessage={editingMessage}
                  onCancelEdit={() => setEditingMessage(null)}
                />
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

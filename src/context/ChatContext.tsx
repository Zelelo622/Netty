"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

interface ChatContextType {
  isOpen: boolean;
  toggleChat: () => void;
  closeChat: () => void;
  activeParticipantId: string | null;
  openChatWith: (uid: string) => void;
}

const ChatContext = createContext<ChatContextType>({
  isOpen: false,
  toggleChat: () => {},
  closeChat: () => {},
  activeParticipantId: null,
  openChatWith: () => {},
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);

  const toggleChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => {
    setIsOpen(false);
    setActiveParticipantId(null);
  }, []);

  const openChatWith = useCallback((uid: string) => {
    setActiveParticipantId(uid);
    setIsOpen(true);
  }, []);

  return (
    <ChatContext.Provider
      value={{ isOpen, toggleChat, closeChat, activeParticipantId, openChatWith }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat необходимо использовать в ChatProvider");
  return context;
};

"use client";

import { createContext, useContext, useState } from "react";

const ChatContext = createContext<{
  bairroSlug: string | undefined;
  setBairroSlug: (slug: string | undefined) => void;
}>({ bairroSlug: undefined, setBairroSlug: () => {} });

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [bairroSlug, setBairroSlug] = useState<string | undefined>(undefined);
  return (
    <ChatContext.Provider value={{ bairroSlug, setBairroSlug }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatSlug() {
  return useContext(ChatContext);
}

"use client";

import { useChatSlug } from "./ChatProvider";
import ChatWidget from "./ChatWidget";

// Lê o bairroSlug do contexto definido pela página e repassa ao ChatWidget.
export default function ChatWidgetConnected() {
  const { bairroSlug } = useChatSlug();
  return <ChatWidget bairroSlug={bairroSlug} />;
}

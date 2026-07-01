"use client";

import { useEffect } from "react";
import { useChatSlug } from "./ChatProvider";

// Componente invisível: ao montar, define o bairroSlug no contexto global do chat.
// Usado pelas páginas de bairro (Server Components) para passar o slug ao ChatWidget.
export default function SetChatSlug({ slug }: { slug: string }) {
  const { setBairroSlug } = useChatSlug();
  useEffect(() => {
    setBairroSlug(slug);
    return () => setBairroSlug(undefined);
  }, [slug, setBairroSlug]);
  return null;
}

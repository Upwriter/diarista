"use client";

import { useChatSlug } from "./ChatProvider";

// Botão que abre o ChatWidget. Usa um evento customizado para comunicar
// com o widget sem prop drilling.
export default function OpenChatButton({ label }: { label: string }) {
  function open() {
    window.dispatchEvent(new CustomEvent("open-chat-widget"));
  }

  return (
    <button
      onClick={open}
      aria-label={label}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-coral-dark"
    >
      {label}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant";
interface Msg { role: Role; content: string }

const FIRST_MSG: Msg = {
  role: "assistant",
  content: "Oi, aqui é a Cida! 😊 Me conta o que você está precisando que eu te ajudo a encontrar uma diarista aqui na sua região.",
};

const WA_FALLBACK = "https://wa.me/5511921630305";

export default function ChatWidget({ bairroSlug }: { bairroSlug?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([FIRST_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userCount = messages.filter((m) => m.role === "user").length;
  const blocked = userCount >= 10;

  // Ouve o evento disparado pelo OpenChatButton
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-chat-widget", handler);
    return () => window.removeEventListener("open-chat-widget", handler);
  }, []);

  // Scroll para o final ao adicionar mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Foco no input ao abrir
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading || blocked) return;

    const newMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          bairroSlug,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ops, tive um problema. Tente novamente ou fale com a gente pelo WhatsApp." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Botão flutuante — some quando o chat está aberto */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir chat para encontrar uma diarista"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full bg-coral px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-coral-dark hover:shadow-xl"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Encontrar uma diarista
        </button>
      )}

      {/* Janela de chat */}
      {open && (
        <div
          role="dialog"
          aria-label="Chat para encontrar diarista"
          aria-modal="true"
          className="fixed bottom-5 right-5 z-50 flex w-[calc(100vw-2.5rem)] max-w-sm flex-col rounded-2xl border border-brand-light bg-white shadow-2xl sm:w-96"
          style={{ height: "min(540px, calc(100dvh - 2.5rem))" }}
        >
          {/* Header da janela */}
          <div className="flex items-center justify-between rounded-t-2xl bg-brand px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-paper/20 text-paper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-bold text-paper leading-none">Cida</p>
                <p className="mt-0.5 text-xs text-paper/70">Atendente virtual</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar chat"
              className="grid h-8 w-8 place-items-center rounded-full text-paper/70 transition-colors hover:bg-paper/10 hover:text-paper"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-brand text-paper"
                      : "rounded-bl-sm bg-brand-light/60 text-ink"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-brand-light/60 px-4 py-3">
                  <span className="flex gap-1" aria-label="Digitando">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-brand/50"
                        style={{ animation: `bounce 1s infinite ${i * 0.2}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Bloqueio por limite */}
          {blocked ? (
            <div className="border-t border-brand-light px-4 py-4 text-center text-sm text-ink/60">
              Para continuar, fale com a gente no{" "}
              <a href={WA_FALLBACK} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:underline">
                WhatsApp
              </a>
            </div>
          ) : (
            <div className="border-t border-brand-light px-3 py-3">
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem…"
                  disabled={loading}
                  aria-label="Mensagem"
                  className="flex-1 rounded-full border border-brand-light bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-brand focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Enviar mensagem"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-paper transition-colors hover:bg-brand-dark disabled:opacity-40"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}

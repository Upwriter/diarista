"use client";

import { useEffect, useState } from "react";

const CHAVE = "ios-pwa-dismiss";

// Mostra uma dica de instalação SOMENTE no iOS/Safari (que não oferece o
// convite automático). Some ao fechar e não reaparece na mesma sessão.
export default function IosInstallBanner() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    try {
      const ua = navigator.userAgent || "";
      const isIOS =
        /iphone|ipad|ipod/i.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      // Outros navegadores no iOS (Chrome/Firefox/Edge) não instalam PWA.
      const isSafari = !/crios|fxios|edgios|opios|mercury/i.test(ua);
      // Já instalado (rodando como app) → não mostra.
      const standalone =
        ("standalone" in navigator && (navigator as unknown as { standalone?: boolean }).standalone) ||
        window.matchMedia("(display-mode: standalone)").matches;

      let jaFechou = false;
      try {
        jaFechou = sessionStorage.getItem(CHAVE) === "1";
      } catch {
        jaFechou = false;
      }

      if (isIOS && isSafari && !standalone && !jaFechou) {
        setVisivel(true);
      }
    } catch {
      // silencioso — o banner é apenas uma dica
    }
  }, []);

  function fechar() {
    setVisivel(false);
    try {
      sessionStorage.setItem(CHAVE, "1");
    } catch {
      // se não houver storage, ao menos some nesta navegação
    }
  }

  if (!visivel) return null;

  return (
    <div className="fixed bottom-3 left-3 z-40 max-w-[78%] rounded-2xl border border-brand-light bg-white p-3.5 shadow-lg sm:max-w-sm">
      <div className="flex items-start gap-3">
        <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-paper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 16V4M12 4 8 8M12 4l4 4" />
            <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">Instale o Diarista Perto de Mim</p>
          <p className="mt-0.5 text-xs leading-snug text-ink/60">
            Toque em <span className="font-semibold text-brand">Compartilhar</span> e depois em{" "}
            <span className="font-semibold text-brand">“Adicionar à Tela de Início”</span>.
          </p>
        </div>
        <button
          onClick={fechar}
          aria-label="Fechar aviso"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

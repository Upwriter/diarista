"use client";

import { useEffect, useRef } from "react";

// Registra UMA vez a visualização do perfil quando a URL traz ?conversa=ID.
export default function RegistrarCliquePerfil({
  diaristaId,
  conversaId,
}: {
  diaristaId: string;
  conversaId: string;
}) {
  const registrado = useRef(false);

  useEffect(() => {
    if (registrado.current) return;
    registrado.current = true;
    fetch("/api/clique-perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diaristaId, conversaId }),
      keepalive: true,
    }).catch(() => {});
  }, [diaristaId, conversaId]);

  return null;
}

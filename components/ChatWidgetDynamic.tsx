import dynamic from "next/dynamic";

// ChatWidgetConnected lê o slug do contexto; carregado só no client (sem SSR).
const ChatWidgetConnected = dynamic(() => import("./ChatWidgetConnected"), { ssr: false });

export default ChatWidgetConnected;

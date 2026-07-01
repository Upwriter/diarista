"use client";

import dynamic from "next/dynamic";

// ssr: false só é permitido em Client Components — por isso o "use client" acima.
const ChatWidgetConnected = dynamic(() => import("./ChatWidgetConnected"), { ssr: false });

export default ChatWidgetConnected;

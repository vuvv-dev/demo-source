'use client';

import dynamic from 'next/dynamic';

const DocimalChatbot = dynamic(
  () => import('@docimal/chatbot').then((m) => m.DocimalChatbot),
  { ssr: false }
);

export function DocimalChatbotWidget() {
  const apiKey = "dcml_pk_187662575c0491702a6d7fb61fb02d8a91919cbf0311fcdf";
  const apiBaseUrl = process.env.NEXT_PUBLIC_DOCIMAL_API_URL || 'https://api.docimal.site/agents/api/v1';

  if (!apiKey) return null;

  return (
    <DocimalChatbot
      apiKey={apiKey}
      apiBaseUrl={apiBaseUrl}
      options={{
        position: 'bottom-right',
        persistSession: true,
      }}
    />
  );
}

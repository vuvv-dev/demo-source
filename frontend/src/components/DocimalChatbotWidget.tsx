'use client';

import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/authStore';

const DocimalChatbot = dynamic(
  () => import('@docimal/chatbot').then((m) => m.DocimalChatbot),
  { ssr: false }
);

export function DocimalChatbotWidget() {
  const apiKey = "dcml_pk_187662575c0491702a6d7fb61fb02d8a91919cbf0311fcdf";
  const apiBaseUrl = process.env.NEXT_PUBLIC_DOCIMAL_API_URL || 'https://api.docimal.site/agents/api/v1';
  const smobileApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://demo.docimal.site/api';

  const { user, token, isAdmin } = useAuthStore();

  if (!apiKey) return null;

  return (
    <DocimalChatbot
      apiKey={apiKey}
      apiBaseUrl={apiBaseUrl}

      // Identity — lets the AI greet by name and scope session history per user
      {...(user && {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          ...(user.phone && { phone: user.phone }),
        },
      })}

      // HTTP request passthrough integration metadata
      // Docimal automation tools read these to make authenticated calls back to SMobile API
      metadata={{
        // Authorization header value — use directly as {{user.metadata.apiToken}} in HTTP card
        ...(token && { apiToken: `${token}` }),
        // SMobile backend URL that the integration tool targets
        // Use as {{user.metadata.apiBaseUrl}} in HTTP card baseUrl field
        apiBaseUrl: smobileApiUrl,
        // User context for AI personalisation and access-control decisions
        isAuthenticated: !!user,
        ...(user && {
          userRole: user.role,
          isAdmin,
          ...(user.address && { userAddress: user.address }),
        }),
      }}

      options={{
        position: 'bottom-right',
        persistSession: true,
      }}
    />
  );
}

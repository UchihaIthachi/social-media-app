// Mark this file as a client component for Next.js
"use client";

// Import necessary modules for React Query and React Query Devtools
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

// ReactQueryProvider component sets up the QueryClientProvider and Devtools for the application
export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize a new QueryClient instance with useState to ensure it's only created once
  const [client] = useState(new QueryClient());

  return (
    // Provide the QueryClient instance to the React component tree
    <QueryClientProvider client={client}>
      {children}
      {/* Add React Query Devtools for debugging, with the devtools initially closed */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

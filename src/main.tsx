import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SurrealDbProvider } from "./surreal/SurrealDBProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function Root() {
  const ENDPOINT = import.meta.env.VITE_SURREALDB_ENDPOINT ?? "ws://localhost:8000/rpc";
  const NS = import.meta.env.VITE_SURREALDB_NS ?? "test";
  const DB = import.meta.env.VITE_SURREALDB_DB ?? "test";
  const USER = import.meta.env.VITE_SURREALDB_USER ?? "root";
  const PASS = import.meta.env.VITE_SURREALDB_PASS ?? "root";

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <SurrealDbProvider
            endpoint={ENDPOINT}
            namespace={NS}
            database={DB}
            user={USER}
            pass={PASS}
        >
            <App />
        </SurrealDbProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);

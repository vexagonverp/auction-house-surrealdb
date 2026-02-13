import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SurrealDbProvider } from "./surreal/SurrealDBProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function Root() {
  const ENDPOINT = import.meta.env.VITE_SURREALDB_ENDPOINT ?? "ws://localhost:8000/rpc";
  const NS = import.meta.env.VITE_SURREALDB_NS ?? "";
  const DB = import.meta.env.VITE_SURREALDB_DB ?? "";
  const USER = import.meta.env.VITE_SURREALDB_USER ?? "";
  const PASS = import.meta.env.VITE_SURREALDB_PASS ?? "";

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

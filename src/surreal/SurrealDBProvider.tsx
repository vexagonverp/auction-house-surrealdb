import { useMutation } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { Surreal } from "surrealdb";

export type ConnectFnProps = {
  client: Surreal;
  endpoint: string;
  namespace: string;
  database: string;
};

export type ConnectFn = (props: ConnectFnProps) => Promise<void>;

type SurrealDbProviderProps = {
  children: React.ReactNode;
  endpoint: string;
  namespace: string;
  database: string;
  user?: string;
  pass?: string;
  autoconnect?: boolean;
  connectFn?: ConnectFn;
};

type SurrealDbProviderState = {
  client: Surreal | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  connect: () => Promise<void>;
};

const initialState: SurrealDbProviderState = {
  client: undefined,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  connect: async () => {},
};

const SurrealDbProviderContext =
  createContext<SurrealDbProviderState>(initialState);

export function SurrealDbProvider({
  children,
  endpoint,
  namespace,
  database,
  user,
  pass,
  autoconnect = true,
  connectFn,
}: SurrealDbProviderProps) {
  const [client] = useState(() => new Surreal());

  const connectDb = useMutation({
    mutationKey: ["connect", endpoint, namespace, database],
    mutationFn: async () => {
      try {
        await client.connect(endpoint);

        if (user && pass) {
            await client.signin({
                username: user,
                password: pass,
            });
        }

        await client.use({  namespace : namespace, database: database });
        
        if (connectFn) {
          await connectFn({ client, endpoint, namespace, database });
        }
        return true;
      } catch (err) {
        console.error("Failed to connect to SurrealDB:", err);
        throw err;
      }
    },
  });

  const connect = async () => {
    await connectDb.mutateAsync();
  };

  useEffect(() => {
    if (autoconnect) {
      connect();
    }

    return () => {
      // client.close(); // Don't close immediately on re-renders in strict mode
    };
  }, []);

  const value = {
    client,
    isLoading: connectDb.isPending,
    isSuccess: connectDb.isSuccess,
    isError: connectDb.isError,
    error: connectDb.error,
    connect,
  };

  return (
    <SurrealDbProviderContext.Provider value={value}>
      {children}
    </SurrealDbProviderContext.Provider>
  );
}

export const useSurrealDb = () => {
  const context = useContext(SurrealDbProviderContext);
  if (context === undefined)
    throw new Error("useSurrealDb must be used within a SurrealDbProvider");
  return context;
};

export const useSurrealDbClient = () => {
  const { client } = useSurrealDb();
  if (!client) throw new Error("SurrealDB client not initialized");
  return client;
};

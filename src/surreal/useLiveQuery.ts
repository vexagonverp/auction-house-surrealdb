import { useEffect } from "react";
import { useSurrealDbClient } from "./SurrealDBProvider";
import { Uuid } from "surrealdb";

export type UseLiveQueryProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  queryUuid?: Uuid;
  table: string;
  callback: (action: "CREATE" | "UPDATE" | "DELETE" | "CLOSE", result: T) => void;
  enabled?: boolean;
};

export const useLiveQuery = <T extends Record<string, unknown>>({
  table,
  callback,
  enabled = true,
}: UseLiveQueryProps<T>) => {
  const dbClient = useSurrealDbClient();

  useEffect(() => {
    if (!enabled || !table) return;

    let queryUuid: Uuid | undefined;

    const runLiveQuery = async () => {
      try {
        // Subscribe to live query
        queryUuid = await dbClient.live(table, (action, result) => {
          callback(action as any, result as T);
        });
      } catch (err) {
        console.error("Live query error:", err);
      }
    };

    runLiveQuery();

    return () => {
      if (queryUuid) {
        dbClient.kill(queryUuid).catch(console.error);
      }
    };
  }, [table, enabled]); // Ensure stable callback if used in dependencies, or remove it from deps
};

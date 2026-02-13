import { useState, useEffect, useCallback } from "react";
import { useSurrealDbClient, useSurrealDb } from "./SurrealDBProvider";
import { useLiveQuery } from "./useLiveQuery";
import { QUERIES } from "./queries";
import { generateRandomItem, calculateSellValue } from "./gameLogic";

// Mock Identity class to match SpacetimeDB interface
export class Identity {
  constructor(public id: string) {}
  
  static fromString(id: string) {
    return new Identity(id);
  }

  toHexString() {
    return this.id.replace("user:", "");
  }

  isEqual(other: any) {
    if (!other) return false;
    
    // Get string representations
    let myId = this.id.toString();
    let otherId = other.id ? other.id.toString() : other.toString();
    
    // Normalize: remove table prefix (e.g. "user:") for loose comparison
    const stripPrefix = (str: string) => str.includes(':') ? str.split(':')[1] : str;
    
    return stripPrefix(myId) === stripPrefix(otherId);
  }
  
  toString() {
    return this.id;
  }
}

export function useAuctionHouse() {
  const { client, isSuccess: connected } = useSurrealDb();
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [identity, setIdentity] = useState<Identity | null>(null);

  // Initialize User & Fetch Data
  useEffect(() => {
    if (!connected || !client) return;

    const init = async () => {
      // 1. Setup Identity
      let storedId = localStorage.getItem("surreal_user_id");
      if (!storedId) {
        const randId = Math.random().toString(36).substring(2, 15);
        storedId = `user:${randId}`;
        localStorage.setItem("surreal_user_id", storedId);
      }
      
      const userId = storedId.startsWith("user:") ? storedId : `user:${storedId}`;
      const idObj = new Identity(userId);
      setIdentity(idObj);
      console.log("Current Identity set to:", userId);

      // 2. Ensure User exists in DB
      try {
        console.log("Ensuring user:", userId);
        const ensureResult = await client.query(QUERIES.ENSURE_USER, {
          id: userId,
          name: `User ${userId.slice(-4)}`
        });
        console.log("Ensure User Result:", ensureResult);
      } catch (e: any) {
        // Ignore "already exists" error
        if (e.message && e.message.includes("already exists")) {
            console.log("User already exists");
        } else {
            console.error("Error ensuring user:", e);
        }
      }

      // 3. Fetch Initial Data
      try {
          // Force a small delay to allow propagation if needed
          await new Promise(r => setTimeout(r, 500));
          
          const itemsResponse = await client.query("SELECT * FROM item");
          const usersResponse = await client.query("SELECT * FROM user");
          
          console.log("Raw Users Response:", usersResponse);

          // Handle SurrealDB 2.0 / raw array response format
          // If response is [[...data]], we want the first element
          // If response is [{result: [...data]}], we want result
          let itemsResult;
          if (Array.isArray(itemsResponse)) {
              if (Array.isArray(itemsResponse[0])) {
                  // Direct array of arrays [[item1, item2]]
                  itemsResult = itemsResponse[0];
              } else if ((itemsResponse[0] as any)?.result) {
                  // Wrapped object [{result: [item1, item2]}]
                  itemsResult = (itemsResponse[0] as any).result;
              } else {
                  // Just an array [item1, item2]
                  itemsResult = itemsResponse;
              }
          } else {
             itemsResult = (itemsResponse as any)?.result || itemsResponse;
          }

          let usersResult;
           if (Array.isArray(usersResponse)) {
              if (Array.isArray(usersResponse[0])) {
                  usersResult = usersResponse[0];
              } else if ((usersResponse[0] as any)?.result) {
                  usersResult = (usersResponse[0] as any).result;
              } else {
                  usersResult = usersResponse;
              }
          } else {
             usersResult = (usersResponse as any)?.result || usersResponse;
          }
          
          console.log("Parsed Users Result:", usersResult);

          if (Array.isArray(itemsResult)) setItems(itemsResult.map(mapItem));
          if (Array.isArray(usersResult)) setUsers(usersResult.map(mapUser));
          console.log("Initial data fetched");
      } catch (e) {
          console.error("Failed to fetch initial data:", e);
      }
    };

    init();
  }, [connected, client]);

    // Live Queries
    useLiveQuery({
    table: "item",
    enabled: connected,
    callback: (action, result: any) => {
        console.log("LiveQuery Item Update:", action, result);
        if (action === "CREATE") {
            setItems(prev => [...prev, mapItem(result)]);
        } else if (action === "UPDATE") {
            setItems(prev => prev.map(i => {
                const itemId = i.id.toString();
                const resultId = result.id.toString();
                return itemId === resultId ? mapItem(result) : i;
            }));
        } else if (action === "DELETE") {
            setItems(prev => prev.filter(i => i.id.toString() !== result.id.toString()));
        }
    }
  });

    useLiveQuery({
    table: "user",
    enabled: connected,
    callback: (action, result: any) => {
        if (action === "CREATE") {
            setUsers(prev => [...prev, mapUser(result)]);
        } else if (action === "UPDATE") {
            setUsers(prev => prev.map(u => u.id.toString() === result.id.toString() ? mapUser(result) : u));
        } else if (action === "DELETE") {
            setUsers(prev => prev.filter(u => u.id.toString() !== result.id.toString()));
        }
    }
  });

  const placeBid = useCallback(async ({ amount, scheduleId }: { amount: number, scheduleId: any }) => {
    if (!client || !identity) return;
    
    // Find item by scheduledId if needed, but we should use ID. 
    // The UI passes scheduledId. We need to map it or find the item.
    const item = items.find(i => i.scheduledId.toString() === scheduleId.toString());
    if (!item) throw new Error("Item not found");

    const results = await client.query(QUERIES.PLACE_BID, {
        userId: identity.id,
        itemId: item.id,
        amount
    });
    console.log("Place Bid Results:", results);

    // Check for application-level errors returned as strings
    if (Array.isArray(results)) {
        for (const res of results) {
            // Check if result is a known error string
            if (!res) continue; // Skip if undefined/null
            const val = (res as any).result;
            if (typeof val === "string" && (
                val === "User not found" || 
                val === "Item not found" || 
                val === "Insufficient balance" || 
                val.includes("Bid must be higher")
            )) {
                throw new Error(val);
            }
        }
    }
  }, [client, identity, items]);

  const generateItem = useCallback(async () => {
    if (!client) return;
    
    // Calculate sell value for previous item if it exists
    const currentItem = items[0];
    let sellValue = 0;
    if (currentItem) {
        sellValue = calculateSellValue(currentItem.name, currentItem.currentPrice);
    }

    const newItem = generateRandomItem();
    // Use BigInt for scheduledId to match u64 if needed, or string if ID
    const scheduledId = Date.now(); 
    
    try {
        await client.query(QUERIES.GENERATE_ITEM, {
            name: newItem.name,
            price: newItem.startingPrice,
            scheduledId,
            sellValue
        });
    } catch (e) {
        console.error("Failed to generate item:", e);
        throw e;
    }
  }, [client, items]);

  return {
    identity,
    connected,
    items,
    users,
    placeBid,
    generateItem
  };
}

// Helpers to map SurrealDB data to App expected format
function mapItem(item: any) {
    // Convert SurrealDB datetime to micros since epoch for UI compatibility
    let micros = 0n;
    if (item.scheduledAt) {
        // Handle SurrealDB Date object or string
        const dateStr = item.scheduledAt.toString();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
             micros = BigInt(date.getTime()) * 1000n;
        }
    }

    return {
        ...item,
        scheduledId: item.scheduledId || 0,
        // Map highestBidderId to Identity object if present
        highestBidderId: item.highestBidderId ? new Identity(item.highestBidderId) : undefined,
        scheduledAt: {
            value: {
                __timestamp_micros_since_unix_epoch__: micros
            }
        }
    };
}

function mapUser(user: any) {
    if (!user) return null;
    console.log("Mapping user:", user);
    return {
        ...user,
        identity: new Identity(user.id.toString())
    };
}

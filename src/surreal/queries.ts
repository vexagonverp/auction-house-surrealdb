import { Surreal } from "surrealdb";

export const QUERIES = {
  // Check if user exists, if not create
  ENSURE_USER: `
    LET $rid = type::record($id);
    LET $user = SELECT * FROM user WHERE id = $rid;
    IF array::len($user) == 0 THEN
      CREATE $rid CONTENT {
        name: $name,
        online: true,
        balance: 5000
      };
    END;
    RETURN SELECT * FROM $rid;
  `,

  // Place a bid
  PLACE_BID: `
    BEGIN TRANSACTION;
    LET $u_id = type::record($userId);
    LET $i_id = type::record($itemId);
    
    LET $user = SELECT * FROM user WHERE id = $u_id;
    LET $item = SELECT * FROM item WHERE id = $i_id;
    
    LET $u = $user[0];
    LET $i = $item[0];
    
    IF $u == NONE THEN
      RETURN "User not found";
    ELSE IF $i == NONE THEN
      RETURN "Item not found";
    ELSE IF $amount > $u.balance THEN
      RETURN "Insufficient balance";
    ELSE IF $amount <= ($i.currentBid ?? 0) THEN
      RETURN "Bid must be higher than current price";
    ELSE
      UPDATE item SET 
        currentBid = $amount, 
        highestBidderId = $u_id,
        scheduledAt = time::now() + 5s
      WHERE id = $i_id;
    END;

    COMMIT TRANSACTION;
  `,

  // Generate Item (and settle previous)
  GENERATE_ITEM: `
    BEGIN TRANSACTION;
    
    // Process previous item (using FOR loop to handle empty case safely)
    FOR $prev IN (SELECT * FROM item LIMIT 1) {
        // If there was a bidder, pay them out
        IF $prev.highestBidderId != NONE THEN
             // Ensure currentBid has a value (default to 0) to avoid math errors
             UPDATE user SET balance += ($sellValue - ($prev.currentBid ?? 0)) WHERE id = $prev.highestBidderId;
        END;
        DELETE item WHERE id = $prev.id;
    };

    // Create new item
    CREATE item CONTENT {
        name: $name,
        currentPrice: $price,
        currentBid: $price,
        scheduledId: $scheduledId,
        scheduledAt: time::now() + 10s,
        highestBidderId: NONE
    };
    COMMIT TRANSACTION;
  `
};

// Ported from spacetimedb/src/index.ts

export const ITEM_TYPES = [
  { name: "Stick", basePrice: 2, sellFactor: 1.0 },
  { name: "Rock", basePrice: 3, sellFactor: 1.0 },
  { name: "Pebble", basePrice: 5, sellFactor: 1.0 },
  { name: "Flower", basePrice: 8, sellFactor: 1.5 },
  { name: "Apple", basePrice: 10, sellFactor: 1.2 },
  { name: "Bread", basePrice: 15, sellFactor: 1.2 },
  { name: "Dagger", basePrice: 20, sellFactor: 1.5 },
  { name: "Compass", basePrice: 25, sellFactor: 2.0 },
  { name: "Shield", basePrice: 30, sellFactor: 1.8 },
  { name: "Map", basePrice: 35, sellFactor: 2.5 },
  { name: "Sword", basePrice: 40, sellFactor: 2.0 },
  { name: "Helm", basePrice: 45, sellFactor: 1.9 },
  { name: "Potion", basePrice: 50, sellFactor: 2.5 },
  { name: "Orb", basePrice: 55, sellFactor: 3.0 },
  { name: "Amulet", basePrice: 60, sellFactor: 3.2 },
  { name: "Ring", basePrice: 70, sellFactor: 3.0 },
  { name: "Chalice", basePrice: 80, sellFactor: 3.5 },
  { name: "Scepter", basePrice: 90, sellFactor: 3.8 },
  { name: "Crown", basePrice: 100, sellFactor: 4.0 },
];

export const ITEM_PREFIXES = [
  // Drawbacks (Low Yield, but Safe)
  { name: "Smelly", priceMult: 0.1, sellMult: 1.4 },
  { name: "Sticky", priceMult: 0.2, sellMult: 1.4 },
  { name: "Dirty", priceMult: 0.3, sellMult: 1.4 },
  { name: "Fragile", priceMult: 0.35, sellMult: 1.4 },
  { name: "Cracked", priceMult: 0.4, sellMult: 1.4 },
  { name: "Broken", priceMult: 0.5, sellMult: 1.4 },
  { name: "Ugly", priceMult: 0.5, sellMult: 1.5 },
  { name: "Moldy", priceMult: 0.6, sellMult: 1.4 },
  { name: "Rusty", priceMult: 0.7, sellMult: 1.5 },
  { name: "Dusty", priceMult: 0.8, sellMult: 1.5 },
  { name: "Counterfeit", priceMult: 4.0, sellMult: 1.5 }, // Expensive, but low ROI
  { name: "Cursed", priceMult: 2.0, sellMult: 1.5 },
  { name: "Haunted", priceMult: 2.5, sellMult: 1.5 },

  // Standard / Good
  { name: "Wooden", priceMult: 1.0, sellMult: 1.6 },
  { name: "Common", priceMult: 1.0, sellMult: 1.6 },
  { name: "Heavy", priceMult: 1.1, sellMult: 1.7 },
  { name: "Polished", priceMult: 1.2, sellMult: 1.8 },
  { name: "Shiny", priceMult: 1.3, sellMult: 1.9 },
  { name: "Iron", priceMult: 1.5, sellMult: 2.0 },
  { name: "Steel", priceMult: 2.0, sellMult: 2.5 },
  { name: "Silver", priceMult: 3.0, sellMult: 3.0 },
  { name: "Reinforced", priceMult: 3.5, sellMult: 3.5 },
  { name: "Gold", priceMult: 5.0, sellMult: 5.0 },
  { name: "Magic", priceMult: 6.0, sellMult: 6.0 },
  { name: "Diamond", priceMult: 8.0, sellMult: 9.0 },
  { name: "Ethereal", priceMult: 7.0, sellMult: 9.0 },
  { name: "Legendary", priceMult: 9.0, sellMult: 10.0 },
  { name: "Ancient", priceMult: 4.0, sellMult: 12.0 },
  { name: "Mythic", priceMult: 10.0, sellMult: 11.0 },
];

export function generateRandomItem() {
  const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
  const prefix = ITEM_PREFIXES[Math.floor(Math.random() * ITEM_PREFIXES.length)];

  // base price * prefix multiplier * variance (0.9 to 1.1)
  const variance = 0.9 + Math.random() * 0.2;
  const startingPrice = Math.floor(
    type.basePrice * prefix.priceMult * variance,
  );

  return {
    name: `${prefix.name} ${type.name}`,
    startingPrice: Math.max(1, startingPrice),
  };
}

export function calculateSellValue(
  name: string,
  startingPrice: number,
): number {
  const parts = name.split(" ");
  const prefixName = parts[0];
  const typeName = parts.length > 1 ? parts.slice(1).join(" ") : parts[0];

  const prefix =
    ITEM_PREFIXES.find((p) => p.name === prefixName) || ITEM_PREFIXES[0];
  const type = ITEM_TYPES.find((t) => t.name === typeName) || ITEM_TYPES[0];

  // Market fluctuation: 0.8x to 1.5x
  const fluctuation = 0.8 + Math.random() * 0.7;

  const value = startingPrice * type.sellFactor * prefix.sellMult * fluctuation;
  return Math.floor(value);
}

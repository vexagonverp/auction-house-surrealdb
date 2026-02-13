import React, { useMemo } from "react";
import {
  IconShieldFilled,
  IconGlassFilled,
  IconDiamondFilled,
  IconBoxMultipleFilled,
  IconCompassFilled,
  IconChartBubbleFilled,
  IconAppleFilled,
  IconBreadFilled,
  IconHexagonFilled,
  IconBookFilled,
  IconPanoramaHorizontalFilled,
  IconPanoramaVerticalFilled,
  IconBoneFilled,
  IconMacroFilled,
  IconAssemblyFilled,
  IconFlaskFilled,
  IconRosetteFilled,
  IconDumplingFilled,
  IconAffiliateFilled,
  IconCandleFilled,
  IconFlareFilled,
  IconInnerShadowTopRightFilled,
  IconLabelFilled,
  IconCrownFilled,
  IconArrowBadgeRightFilled,
  IconChessKingFilled,
} from "@tabler/icons-react";

interface ItemGeneratorProps {
  name: string;
}

// Mapping item types to Tabler Icons
const TYPE_ICON_MAP: Record<string, React.ElementType> = {
  // Weapons
  Sword: IconLabelFilled,
  Dagger: IconArrowBadgeRightFilled,
  Stick: IconBoneFilled, // Closest to stick?

  // Armor/Defense
  Shield: IconShieldFilled,
  Helm: IconChessKingFilled,

  // Accessories
  Ring: IconAssemblyFilled,
  Amulet: IconRosetteFilled,
  Crown: IconCrownFilled,

  // Magic
  Staff: IconCandleFilled,
  Scepter: IconFlareFilled,
  Wand: IconAffiliateFilled,
  Potion: IconFlaskFilled,
  Orb: IconInnerShadowTopRightFilled,

  // Tools/Misc
  Scroll: IconPanoramaVerticalFilled,
  Book: IconBookFilled,
  Map: IconPanoramaHorizontalFilled,
  Compass: IconCompassFilled,
  Chalice: IconGlassFilled,
  Gem: IconHexagonFilled,
  Diamond: IconDiamondFilled,

  // Nature/Misc (Fallbacks/Approx)
  Rock: IconDumplingFilled,
  Pebble: IconChartBubbleFilled,
  Flower: IconMacroFilled,
  Apple: IconAppleFilled,
  Bread: IconBreadFilled,
};

// Colors for visual flair
const RARITY_COLORS: Record<string, string> = {
  // Bad / Low
  Smelly: "#5d4037",
  Sticky: "#795548",
  Dirty: "#6d4c41",
  Fragile: "#8d6e63",
  Cracked: "#a1887f",
  Broken: "#8d6e63",
  Ugly: "#4e342e",
  Moldy: "#24291fff",
  Rusty: "#e65100",
  Dusty: "#616161",
  Counterfeit: "#212121",
  Cursed: "#4a148c",
  Haunted: "#311b92",

  // Standard
  Wooden: "#8d6e63",
  Common: "#616161",
  Heavy: "#424242",
  Polished: "#607d8b",
  Shiny: "#78909c",
  Iron: "#455a64",
  Steel: "#37474f",
  Silver: "#757575",
  Reinforced: "#263238",

  // High Tier
  Gold: "#fbc02d",
  Magic: "#0288d1",
  Diamond: "#00acc1",
  Ethereal: "#14ba91ff",
  Legendary: "#e65100",
  Ancient: "#ef6c00",
  Mythic: "#aa00ff",
};

const EFFECT_STYLES: Record<string, React.CSSProperties> = {
  Gold: { filter: "drop-shadow(0 0 4px #ffd700)" },
  Magic: { filter: "drop-shadow(0 0 5px #29b6f6)" },
  Diamond: { filter: "drop-shadow(0 0 6px #b2ebf2)" },
  Ethereal: { filter: "drop-shadow(0 0 8px #00e676)" },
  Legendary: { filter: "drop-shadow(0 0 8px #ff6d00)" },
  Mythic: { filter: "drop-shadow(0 0 10px #d500f9)" },
  Cursed: { filter: "drop-shadow(0 0 5px #4a148c)" },
  Haunted: { filter: "drop-shadow(0 0 5px #311b92)" },
  Silver: { filter: "drop-shadow(0 0 2px #b0bec5)" },
  Iron: { filter: "drop-shadow(0 0 1px #546e7a)" },
};

const ANIMATION_MAP: Record<string, string> = {
  // High Tier
  Mythic: "mythic-pulse 4s infinite ease-in-out",
  Legendary: "float 4s infinite ease-in-out",
  Ethereal: "ghost-float 5s infinite ease-in-out",
  Ancient: "dusty-wobble 8s infinite ease-in-out",
  Magic: "magic-glow 3s infinite alternate",

  // Negative
  Cursed: "vibrate 0.2s infinite",
  Haunted: "ghost-float 4s infinite ease-in-out",
  Broken: "shake 0.8s infinite",
  Moldy: "bio-pulse 3s infinite ease-in-out",
  Smelly: "bio-pulse 3s infinite ease-in-out",
  Fragile: "shiver 3s infinite ease-in-out",
  Counterfeit: "glitch 4s infinite steps(2)",

  // Material
  Shiny: "shine-flash 5s infinite",
  Polished: "shine-flash 5s infinite",
  Silver: "shine-flash 6s infinite",
  Gold: "shine-flash 4s infinite",
  Diamond: "prism 6s infinite linear",
};
export const ItemGenerator: React.FC<ItemGeneratorProps> = ({ name }) => {
  const { prefix, type, displayName } = useMemo(() => {
    if (!name) return { prefix: "", type: "", displayName: "Unknown" };

    const parts = name.split(" ");
    const prefix = parts[0];
    const type = parts.slice(1).join(" ");

    return { prefix, type, displayName: name };
  }, [name]);

  const IconComponent = useMemo(() => {
    if (TYPE_ICON_MAP[type]) return TYPE_ICON_MAP[type];
    return IconBoxMultipleFilled; // Fallback
  }, [type]);

  // Determine Styles
  const iconStyle = useMemo(() => {
    const baseColor = RARITY_COLORS[prefix] || "#000"; // Default black/dark
    const effect = EFFECT_STYLES[prefix] || {};
    const animation = ANIMATION_MAP[prefix] || "none";

    return {
      color: baseColor,
      ...effect,
      animation: animation,
      transition: "all 0.3s ease",
    };
  }, [prefix]);

  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1)); }
            50% { transform: translateY(-6px); filter: drop-shadow(0 10px 4px rgba(0,0,0,0.1)); }
          }
          @keyframes mythic-pulse {
            0% { transform: scale(1); filter: brightness(100%) hue-rotate(0deg); }
            50% { transform: scale(1.1); filter: brightness(130%) drop-shadow(0 0 10px currentColor) hue-rotate(15deg); }
            100% { transform: scale(1); filter: brightness(100%) hue-rotate(0deg); }
          }
          @keyframes magic-glow {
            0% { filter: drop-shadow(0 0 2px currentColor); }
            100% { filter: drop-shadow(0 0 8px currentColor) brightness(1.2); }
          }
           @keyframes ghost-float {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.9; }
            50% { transform: translateY(-5px) scale(0.95); opacity: 0.6; }
          }
          @keyframes dusty-wobble {
             0%, 100% { transform: rotate(-3deg); }
             50% { transform: rotate(3deg); }
          }
          @keyframes vibrate {
            0% { transform: translate(0); }
            20% { transform: translate(-1px, 1px); }
            40% { transform: translate(-1px, -1px); }
            60% { transform: translate(1px, 1px); }
            80% { transform: translate(1px, -1px); }
            100% { transform: translate(0); }
          }
          @keyframes shake {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(5deg); }
            75% { transform: rotate(-5deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes shine-flash {
            0%, 80% { filter: brightness(100%); }
            85% { filter: brightness(180%) drop-shadow(0 0 5px white); }
            100% { filter: brightness(100%); }
          }
           @keyframes prism {
             0% { filter: hue-rotate(0deg); }
             100% { filter: hue-rotate(360deg); }
          }
          @keyframes bio-pulse {
             0%, 100% { transform: scale(1); filter: contrast(100%); }
             50% { transform: scale(1.05); filter: contrast(120%) drop-shadow(0 0 3px #558b2f); }
          }
          @keyframes shiver {
             0%, 100% { transform: translateX(0); }
             90% { transform: translateX(0); }
             92% { transform: translateX(-1px); }
             94% { transform: translateX(1px); }
             96% { transform: translateX(-1px); }
             98% { transform: translateX(1px); }
          }
           @keyframes glitch {
             0%, 90% { opacity: 1; transform: skewX(0); }
             92% { opacity: 0.8; transform: skewX(-10deg); }
             94% { opacity: 1; transform: skewX(10deg); }
             96% { opacity: 0.9; transform: skewX(0); }
             98% { opacity: 1; transform: skewX(-5deg); }
          }
          @keyframes pulse-slow {
             0%, 100% { opacity: 0.3; transform: scale(1); }
             50% { opacity: 0.15; transform: scale(0.9); }
          }
        `}
      </style>
      <div
        style={{ display: "inline-flex", alignItems: "center", gap: "12px" }}
      >
        <span style={{ fontWeight: 600, fontSize: "1.1em" }}>
          {displayName}
        </span>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
          }}
        >
          {/* Optional: Add a subtle background glow for high tier items */}
          {["Mythic", "Legendary", "Ancient"].includes(prefix) && (
            <div
              style={{
                position: "absolute",
                width: "140%",
                height: "140%",
                background: RARITY_COLORS[prefix],
                filter: "blur(14px)",
                opacity: 0.3,
                borderRadius: "50%",
                zIndex: 0,
                animation: "pulse-slow 4s infinite alternate",
              }}
            />
          )}
          <IconComponent
            size={30}
            style={{ ...iconStyle, position: "relative", zIndex: 1 }}
            stroke={1.5}
          />
        </div>
      </div>
    </>
  );
};

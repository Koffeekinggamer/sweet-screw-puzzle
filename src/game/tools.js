import { colorOf } from "./colors.js";

export const TOOL_DEFS = {
  "screwdriver-pink": {
    id: "screwdriver-pink",
    name: "Pink",
    icon: "🔧",
    color: "pink",
    kind: "screwdriver",
  },
  "screwdriver-blue": {
    id: "screwdriver-blue",
    name: "Blue",
    icon: "🔧",
    color: "blue",
    kind: "screwdriver",
  },
  "screwdriver-green": {
    id: "screwdriver-green",
    name: "Green",
    icon: "🔧",
    color: "green",
    kind: "screwdriver",
  },
  "screwdriver-yellow": {
    id: "screwdriver-yellow",
    name: "Yellow",
    icon: "🔧",
    color: "yellow",
    kind: "screwdriver",
  },
  wrench: {
    id: "wrench",
    name: "Wrench",
    icon: "🔧",
    color: "orange",
    kind: "wrench",
    css: "#7dcf4a",
  },
  drill: {
    id: "drill",
    name: "Drill",
    icon: "🪛",
    color: "white",
    kind: "drill",
    css: "#4da3ff",
  },
};

export function toolMatchesScrew(toolId, screw) {
  const tool = TOOL_DEFS[toolId];
  if (!tool) return false;
  const required = screw.tool || `screwdriver-${screw.color}`;
  if (tool.kind === "wrench") return required === "wrench" || screw.tool === "wrench";
  if (tool.kind === "drill") return required === "drill" || screw.tool === "drill";
  // screwdriver: color match and not special tool
  if (screw.tool && screw.tool !== `screwdriver-${screw.color}`) return false;
  return tool.color === screw.color;
}

export function toolCss(toolId) {
  const t = TOOL_DEFS[toolId];
  if (!t) return "#4da3ff";
  if (t.css) return t.css;
  return colorOf(t.color).css;
}

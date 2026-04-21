export type HighlightColorKey =
  | "blue" // traverse node
  | "yellow" // found parent node
  | "red" // remove node
  | "green"; // success

export const NODE_COLORS: Record<HighlightColorKey, string> = {
  blue: "#62A2F7", // node ที่กำลัง traverse
  yellow: "#F7AD45", // node ที่เป็น parent (found)
  red: "#EF4444", // node ที่กำลัง remove
  green: "#4CAF7D", // insert/operation สำเร็จ
};

//  สีของ EDGE
export const EDGE_HIGHLIGHT_COLOR = "#F7AD45";
export const EDGE_DEFAULT_COLOR = "#999999";

export function resolveColor(color: string): string {
  if (color in NODE_COLORS) {
    return NODE_COLORS[color as HighlightColorKey];
  }
  return color;
}

export function resolveEdgeColor(_color: string): string {
  return EDGE_HIGHLIGHT_COLOR;
}

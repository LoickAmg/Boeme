import { ogFonts, renderMark } from "@/lib/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  return renderMark(size.width, await ogFonts());
}

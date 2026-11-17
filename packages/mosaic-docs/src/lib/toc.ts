export interface HeadingBox {
  slug: string;
  top: number;
  bottom: number;
}

const VISIBLE_RATIO = 0.9;

export function activeSlugs(boxes: HeadingBox[], view: { top: number; bottom: number }): string[] {
  const visible = boxes.filter(box => visibleRatio(box, view) >= VISIBLE_RATIO);
  if (visible.length > 0) {
    return visible.map(box => box.slug);
  }
  const above = boxes.filter(box => box.bottom <= view.top).at(-1);
  return above ? [above.slug] : [];
}

function visibleRatio(box: HeadingBox, view: { top: number; bottom: number }): number {
  const height = box.bottom - box.top;
  if (height <= 0) {
    return 0;
  }
  const shown = Math.min(box.bottom, view.bottom) - Math.max(box.top, view.top);
  return Math.max(shown, 0) / height;
}

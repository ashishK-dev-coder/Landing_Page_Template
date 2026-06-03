import { reorderArray } from "./reorderArray";

export type ImageSlot<T> = {
  item: T;
  itemIndex: number;
  galleryIndex: number;
};

/** Build gallery-index map for items matching `isImage`. */
export function getImageSlots<T>(
  items: T[],
  isImage: (item: T) => boolean,
): ImageSlot<T>[] {
  const slots: ImageSlot<T>[] = [];
  let galleryIndex = 0;
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    const item = items[itemIndex]!;
    if (!isImage(item)) continue;
    slots.push({ item, itemIndex, galleryIndex });
    galleryIndex++;
  }
  return slots;
}

/** Reorder among image-only slots; persists against full items array indices. */
export function reorderImageSlots<T>(
  items: T[],
  galleryFrom: number,
  galleryTo: number,
  isImage: (item: T) => boolean,
): T[] {
  const slots = getImageSlots(items, isImage);
  const from = slots[galleryFrom]?.itemIndex;
  const to = slots[galleryTo]?.itemIndex;
  if (from === undefined || to === undefined || from === to) return items;
  return reorderArray(items, from, to);
}

import type { StyleRule } from './slot-recipe';

/**
 * The empty seam that holds every Mosaic slot id.
 *
 * Component recipe files contribute their slot ids by augmenting this interface
 * via `declare module`, so there is no central list to maintain:
 *
 * @example
 * declare module '../registry' {
 *   interface MosaicSlotRegistry {
 *     button: true;
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MosaicSlotRegistry {}

/** The union of every registered slot id. Resolves to `never` until a recipe augments the registry. */
export type MosaicSlotId = keyof MosaicSlotRegistry;

/**
 * The `appearance.elements` shape — a map of slot id → style override (or className string).
 *
 * Registered slot ids autocomplete; any other string is still accepted so a slot whose
 * file isn't imported in a given consumer stays loose-but-valid.
 */
export type MosaicElements = Partial<Record<MosaicSlotId | (string & {}), StyleRule | string>>;

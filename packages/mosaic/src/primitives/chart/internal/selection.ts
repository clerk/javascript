import type { ChartActive, ChartCategory, ChartSelection } from '../types';

export type VerticalMove = 'up' | 'down';

/**
 * A chart type's selection rules. A chart-type hook builds one per layout, closing over its
 * categories and data, and the selection engine asks it everything that is not shared.
 */
export type SelectionModel<
  TSelection extends ChartSelection,
  TActive extends ChartActive,
  TCategory extends ChartCategory = ChartCategory,
> = Readonly<{
  /** The selection under a pointer at plot-space `y` over `category`. `current` lets a model hold its pick near a boundary. */
  hitTest: (category: TCategory, y: number, current: TSelection | null) => TSelection | null;
  /**
   * Where the keyboard lands on `category`. Up and Down pass `move`; otherwise the model keeps what it
   * can of `current`. Null when the category has nothing to select.
   */
  land: (category: TCategory, move: VerticalMove | undefined, current: TSelection | null) => TSelection | null;
  /** The selection read against the current data, or null when the data no longer has it. */
  resolve: (selection: TSelection, category: TCategory) => TActive | null;
  /** Follows the category name in an announcement, such as `positive values`. */
  describe: (selection: TSelection) => string;
  /** The sentence about Up and Down in the keyboard instructions. */
  verticalInstructions: string;
  /** Where a tooltip points on the Y axis, in chart coordinates. */
  anchorY: (selection: TSelection, category: TCategory) => number;
  /** State the interaction surface carries for styling, such as `data-active-section`. */
  surfaceAttributes: (selection: TSelection | null) => Readonly<Record<`data-${string}`, string | undefined>>;
}>;

export type Selected<TSelection> = Readonly<{
  status: 'selected';
  /** `external` is a selection set through `selection` or `select`. */
  source: 'pointer' | 'keyboard' | 'external';
  category: string;
  /** Null when the keyboard lands on a category with nothing to select. */
  selection: TSelection | null;
}>;

/**
 * `dismissed` is the state after Escape: the period is remembered, so Enter reselects it instead of
 * activating it.
 */
export type SelectionState<TSelection> =
  | Readonly<{ status: 'none' }>
  | Readonly<{ status: 'dismissed' }>
  | Selected<TSelection>;

export type SelectionAction<TSelection> =
  | Readonly<{ type: 'pointer'; selection: TSelection | null }>
  | Readonly<{ type: 'keyboard'; category: string | undefined; selection: TSelection | null }>
  | Readonly<{ type: 'select'; selection: TSelection }>
  | Readonly<{ type: 'clear' }>
  | Readonly<{ type: 'dismiss' }>;

export const NO_SELECTION = { status: 'none' } as const satisfies SelectionState<never>;

export function selectionReducer<TSelection extends ChartSelection>(
  state: SelectionState<TSelection>,
  action: SelectionAction<TSelection>,
): SelectionState<TSelection> {
  switch (action.type) {
    case 'pointer':
      return action.selection
        ? { status: 'selected', source: 'pointer', category: action.selection.category, selection: action.selection }
        : NO_SELECTION;
    case 'select':
      return {
        status: 'selected',
        source: 'external',
        category: action.selection.category,
        selection: action.selection,
      };
    case 'clear':
      return state.status === 'dismissed' ? state : NO_SELECTION;
    case 'dismiss':
      return { status: 'dismissed' };
    case 'keyboard':
      return action.category === undefined
        ? NO_SELECTION
        : { status: 'selected', source: 'keyboard', category: action.category, selection: action.selection };
  }
}

export function selectedState<TSelection>(state: SelectionState<TSelection>): Selected<TSelection> | null {
  return state.status === 'selected' ? state : null;
}

/** The public value of a selection state: the selection, or null. */
export function toPublicSelection<TSelection>(state: SelectionState<TSelection>): TSelection | null {
  return state.status === 'selected' ? state.selection : null;
}

/** Selections are flat records of primitives, so two with the same fields name the same thing. */
export function sameSelection(a: ChartSelection | null, b: ChartSelection | null) {
  if (!a || !b) {
    return a === b;
  }
  const aEntries = Object.entries(a);
  const bValues = new Map(Object.entries(b));
  return aEntries.length === bValues.size && aEntries.every(([key, value]) => bValues.get(key) === value);
}

/**
 * Applies a controlled value to the stored state. The stored state is kept while its public value
 * matches, so a dismissed period and a keyboard selection on an empty period survive a controlled
 * `null`; otherwise the controlled value wins.
 */
export function reconcileSelection<TSelection extends ChartSelection>(
  state: SelectionState<TSelection>,
  value: TSelection | null,
): SelectionState<TSelection> {
  if (sameSelection(toPublicSelection(state), value)) {
    return state;
  }
  return value ? { status: 'selected', source: 'external', category: value.category, selection: value } : NO_SELECTION;
}

/** Index of the category whose center is nearest `x`, the later one on a tie. -1 when there is none. */
export function nearestCategory(categories: readonly Pick<ChartCategory, 'center'>[], x: number) {
  let low = 0;
  let high = categories.length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const left = categories[middle]?.center ?? 0;
    const right = categories[middle + 1]?.center ?? 0;
    if (x - left >= right - x) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return high;
}

export type KeyIntent =
  | Readonly<{ type: 'dismiss' }>
  | Readonly<{ type: 'select'; index: number; move: VerticalMove | undefined; activate: boolean }>;

export function getKeyIntent(key: string, index: number, lastIndex: number, canActivate: boolean): KeyIntent | null {
  switch (key) {
    case 'Escape':
      return { type: 'dismiss' };
    case 'ArrowUp':
      return { type: 'select', index, move: 'up', activate: false };
    case 'ArrowDown':
      return { type: 'select', index, move: 'down', activate: false };
    case 'ArrowLeft':
      return { type: 'select', index: index - 1, move: undefined, activate: false };
    case 'ArrowRight':
      return { type: 'select', index: index + 1, move: undefined, activate: false };
    case 'Home':
      return { type: 'select', index: 0, move: undefined, activate: false };
    case 'End':
      return { type: 'select', index: lastIndex, move: undefined, activate: false };
    case 'Enter':
    case ' ':
      return canActivate ? { type: 'select', index, move: undefined, activate: true } : null;
    default:
      return null;
  }
}

export function getKeyboardAnnouncement<TSelection extends ChartSelection, TCategory extends ChartCategory>(
  selected: Selected<TSelection> | null,
  category: TCategory | undefined,
  model: Pick<SelectionModel<TSelection, ChartActive, TCategory>, 'describe' | 'land'>,
  formatCategory: (category: string) => string | null,
) {
  if (selected?.source !== 'keyboard') {
    return '';
  }
  if (selected.selection) {
    const label = formatCategory(selected.category) ?? selected.category;
    return `${label}, ${model.describe(selected.selection)}`;
  }
  const hasValues = !!category && model.land(category, undefined, null) !== null;
  return hasValues ? '' : 'No values for this period';
}

export function getKeyboardInstructions(verticalInstructions: string, canActivate: boolean) {
  return [
    'Use Left and Right to choose a period, or Home and End to jump to the first or last.',
    verticalInstructions,
    canActivate ? 'Press Enter or Space to open the selected period.' : '',
    'Press Escape to dismiss.',
  ]
    .filter(Boolean)
    .join(' ');
}

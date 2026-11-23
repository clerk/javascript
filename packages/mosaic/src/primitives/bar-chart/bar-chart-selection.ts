import type { StackedBarLayout } from './bar-chart-layout';
import type { ActiveBar, BarCategory, BarSection, BarSelection } from './types';

export type Selected = Readonly<{
  status: 'selected';
  /** `external` is a selection set through `selection` or `select`. */
  source: 'pointer' | 'keyboard' | 'external';
  category: string;
  /** Null when the keyboard lands on a category with nothing to select. */
  section: BarSection | null;
}>;

/**
 * `dismissed` is the state after Escape: the period is remembered, so Enter reselects it instead of
 * activating it.
 */
export type SelectionState = Readonly<{ status: 'none' }> | Readonly<{ status: 'dismissed' }> | Selected;

export type SelectionAction =
  | Readonly<{ type: 'pointer'; selection: Selected | null }>
  | Readonly<{ type: 'keyboard'; category: BarCategory | undefined; section?: BarSection }>
  | Readonly<{ type: 'select'; selection: BarSelection }>
  | Readonly<{ type: 'clear' }>
  | Readonly<{ type: 'dismiss' }>;

export const NO_SELECTION: SelectionState = { status: 'none' };

export function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  switch (action.type) {
    case 'pointer':
      return action.selection ?? NO_SELECTION;
    case 'select':
      return { status: 'selected', source: 'external', ...action.selection };
    case 'clear':
      return state.status === 'dismissed' ? state : NO_SELECTION;
    case 'dismiss':
      return { status: 'dismissed' };
    case 'keyboard': {
      const { category, section } = action;
      if (!category) {
        return NO_SELECTION;
      }
      return {
        status: 'selected',
        source: 'keyboard',
        category: category.key,
        section:
          section && category.sections[section]
            ? section
            : category.sections.positive
              ? 'positive'
              : category.sections.negative
                ? 'negative'
                : null,
      };
    }
  }
}

export function hitTest<TDatum>(
  layout: StackedBarLayout<TDatum>,
  local: Readonly<{ x: number; y: number }>,
  stickySection: BarSection | undefined,
): Selected | null {
  const first = layout.categories[0];
  if (!first) {
    return null;
  }
  const datumIndex = Math.max(
    0,
    Math.min(layout.categories.length - 1, Math.round((local.x - first.center) / layout.step)),
  );
  const category = layout.categories[datumIndex];
  if (!category) {
    return null;
  }
  const { positive, negative } = category.sections;
  if (!positive && !negative) {
    return null;
  }
  const nearZero = Math.abs(local.y - layout.zeroY) <= Math.max(4, Math.round(layout.plot.height * 0.015));
  const section: BarSection = !negative
    ? 'positive'
    : !positive
      ? 'negative'
      : nearZero
        ? (stickySection ?? 'positive')
        : local.y < layout.zeroY
          ? 'positive'
          : 'negative';
  return { status: 'selected', source: 'pointer', category: category.key, section };
}

export function selectedState(state: SelectionState): Selected | null {
  return state.status === 'selected' ? state : null;
}

export function isSelectable(selection: Selected, category: BarCategory) {
  return selection.section === null || category.sections[selection.section];
}

/** The public value of a selection state: the selected category and section, or null. */
export function toBarSelection(state: SelectionState): BarSelection | null {
  return state.status === 'selected' && state.section ? { category: state.category, section: state.section } : null;
}

export function sameSelection(a: BarSelection | null, b: BarSelection | null) {
  return a?.category === b?.category && a?.section === b?.section;
}

/**
 * Applies a controlled value to the stored state. The stored state is kept while its public value
 * matches, so a dismissed period and a keyboard selection on an empty period survive a controlled
 * `null`; otherwise the controlled value wins.
 */
export function reconcileSelection(state: SelectionState, value: BarSelection | null): SelectionState {
  if (sameSelection(toBarSelection(state), value)) {
    return state;
  }
  return value ? { status: 'selected', source: 'external', ...value } : NO_SELECTION;
}

export function getActiveBar<TDatum>(
  selection: Selected | null,
  data: readonly TDatum[],
  categoryByKey: ReadonlyMap<string, BarCategory>,
): ActiveBar<TDatum> | null {
  const category = selection ? categoryByKey.get(selection.category) : undefined;
  if (!selection?.section || !category?.sections[selection.section]) {
    return null;
  }
  const datum = data[category.datumIndex];
  if (datum === undefined) {
    return null;
  }
  return {
    category: category.key,
    section: selection.section,
    datumIndex: category.datumIndex,
    datum,
    hasValues: category.hasValues,
    projected: category.projected,
  };
}

export type KeyIntent =
  | Readonly<{ type: 'dismiss' }>
  | Readonly<{ type: 'select'; index: number; section: BarSection | undefined; activate: boolean }>;

export function getKeyIntent(
  key: string,
  index: number,
  lastIndex: number,
  section: BarSection | undefined,
  canActivate: boolean,
): KeyIntent | null {
  switch (key) {
    case 'Escape':
      return { type: 'dismiss' };
    case 'ArrowUp':
      return { type: 'select', index, section: 'positive', activate: false };
    case 'ArrowDown':
      return { type: 'select', index, section: 'negative', activate: false };
    case 'ArrowLeft':
      return { type: 'select', index: index - 1, section, activate: false };
    case 'ArrowRight':
      return { type: 'select', index: index + 1, section, activate: false };
    case 'Home':
      return { type: 'select', index: 0, section, activate: false };
    case 'End':
      return { type: 'select', index: lastIndex, section, activate: false };
    case 'Enter':
    case ' ':
      return canActivate ? { type: 'select', index, section, activate: true } : null;
    default:
      return null;
  }
}

export function getKeyboardAnnouncement(
  selection: Selected | null,
  category: BarCategory | undefined,
  formatCategory: (category: string) => string | null,
) {
  if (selection?.source !== 'keyboard') {
    return '';
  }
  if (selection.section) {
    const label = formatCategory(selection.category) ?? selection.category;
    return `${label}, ${selection.section} values`;
  }
  const hasValues = !!category && (category.sections.positive || category.sections.negative);
  return hasValues ? '' : 'No values for this period';
}

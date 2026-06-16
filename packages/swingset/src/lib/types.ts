import type React from 'react';

export type TextKnob = {
  type: 'text';
  label: string;
  defaultValue: string;
};

export type BooleanKnob = {
  type: 'boolean';
  label: string;
  defaultValue: boolean;
};

export type SelectKnob = {
  type: 'select';
  label: string;
  options: string[];
  defaultValue: string;
};

export type NumberKnob = {
  type: 'number';
  label: string;
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
};

export type KnobDef = TextKnob | BooleanKnob | SelectKnob | NumberKnob;

export type KnobRecord = Record<string, KnobDef>;

export type KnobValues = Record<string, string | boolean | number>;

export interface StoryMeta {
  group: string;
  title: string;
  /**
   * Optional human-friendly label shown in the sidebar. Falls back to `title` when
   * omitted. Use this when the desired sidebar text differs from the component name
   * (which still drives the slug and the `<Title />` tag).
   */
  label?: string;
  /**
   * Path to the file that exports the documented component, relative to the monorepo
   * root (e.g. `packages/ui/src/mosaic/components/button.tsx`). Rendered as a "View
   * source" link to the file on GitHub. See `lib/source.ts`.
   */
  source?: string;
  styles?: {
    _variants: Record<string, Record<string, unknown>>;
    _defaultVariants?: Record<string, unknown>;
  };
  /**
   * Ad-hoc knobs for props that aren't CVA variants — e.g. free-text content like a dialog
   * `header`/`description`. Merged with the variant-derived knobs, so the prop table renders
   * an editable control (text/number/select) and the preview + usage snippet update live.
   * Keyed by prop name.
   */
  knobs?: KnobRecord;
}

// Loose component type so story modules don't require double-casting through unknown.
export type StoryComponent = React.ComponentType<Record<string, unknown>>;

export interface StoryModule {
  meta: StoryMeta;
  [storyName: string]: StoryComponent | StoryMeta;
}

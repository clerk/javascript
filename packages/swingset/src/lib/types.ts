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

export type StoryStatus = 'stable' | 'wip';

export type WipSubstatus =
  /** View renders against mock/static data; not yet connected to its model/controller. */
  | 'needs wire-up'
  /** Awaiting final visual design or a design review. */
  | 'needs design'
  /** Accessibility pass outstanding. */
  | 'needs a11y'
  /** Implementation settled but the docs page is incomplete. */
  | 'needs docs'
  /** Works end to end; rough edges remain. */
  | 'needs polish';

export interface StoryMeta {
  group: string;
  title: string;
  /**
   * Maturity of the documented entry, shown as a dot beside it in the sidebar and a
   * badge beside the page title. Omit it and the entry displays no status anywhere.
   */
  status?: StoryStatus;
  /**
   * Optional refinement of a wip entry — why it is still wip. Shown in the page's
   * status badge (`wip: needs wire-up`) and the sidebar dot's tooltip. Ignored
   * when `status` is `'stable'`; most wip entries won't need one.
   */
  substatus?: WipSubstatus;
  /** Controls the documentation canvas width. Wide compositions still keep prose at a readable measure. */
  layout?: 'default' | 'wide';
  /**
   * Optional human-friendly label shown in the sidebar. Falls back to `title` when
   * omitted. Use this when the desired sidebar text differs from the component name
   * (which still drives the slug and the `<Title />` tag).
   */
  label?: string;
  navigation?: {
    family?: string;
    category?: string;
    order?: number;
  };
  /**
   * Path to the file that exports the documented component, relative to the monorepo
   * root (e.g. `packages/ui/src/mosaic/components/button.tsx`). Rendered as a "View
   * source" link to the file on GitHub. See `lib/source.ts`.
   */
  source?: string;
  /**
   * The component's variant surface, described by hand. Drives the playground knobs and
   * the `<PropTable>` rows. StyleX has no runtime recipe to derive this from.
   */
  styles?: {
    _variants: Record<string, Record<string, unknown>>;
    _defaultVariants?: Record<string, unknown>;
  };
}

// Loose component type so story modules don't require double-casting through unknown.
export type StoryComponent = React.ComponentType<Record<string, unknown>>;

export interface StoryModule {
  meta: StoryMeta;
  /**
   * Raw source text of the `*.stories.tsx` file, exposed via a `?raw` self-import
   * (`export { default as __source } from './x.stories?raw'`). Present only on modules
   * that opt into the `<Story>` code footer; `StoryEmbed` extracts the previewed story's
   * function from it. See `lib/extractStorySource.ts`.
   */
  __source?: string;
  [storyName: string]: StoryComponent | StoryMeta | string | undefined;
}

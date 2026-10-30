import type { ComponentType } from 'react';

import type { CursorKind } from './Cursor';

export type StudioLayout = 'component' | 'code' | 'split';

export type StudioFormat = 'landscape' | 'square' | 'portrait';

export type StudioScheme = 'light' | 'dark';

export type StudioBadges = 'both' | 'logo' | 'none';

export interface CursorAction {
  at: number;
  target?: string;
  text?: string;
  click?: boolean;
  drag?: string;
  scroll?: number;
  type?: string;
  park?: true | { x: number; y: number };
  steer?: boolean;
  cursor?: CursorKind;
  hide?: boolean;
}

export interface StudioStep<State> {
  label: string;
  layout: StudioLayout;
  duration: number;
  hold?: number;
  state?: Partial<State>;
  code?: string;
  cursor?: CursorAction[];
}

export interface Showcase<State = Record<string, never>> {
  slug: string;
  title: string;
  summary: string;
  format?: StudioFormat;
  scheme?: StudioScheme;
  lang?: string;
  file?: string;
  focus?: { width: number; height: number };
  cellPadding?: number;
  plain?: boolean;
  initialState: State;
  View?: ComponentType<{ state: State }>;
  code?: (state: State) => string;
  steps: StudioStep<State>[];
}

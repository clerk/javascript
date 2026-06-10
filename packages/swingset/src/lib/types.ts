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
  styles?: {
    _variants: Record<string, Record<string, unknown>>;
    _defaultVariants?: Record<string, unknown>;
  };
}

// Loose component type so story modules don't require double-casting through unknown.
export type StoryComponent = React.ComponentType<Record<string, unknown>>;

export interface StoryModule {
  meta: StoryMeta;
  [storyName: string]: StoryComponent | StoryMeta;
}

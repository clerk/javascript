import { createContext, useContext } from 'react';

export interface TagInputTag {
  value: string;
  present: boolean;
  invalid: boolean;
}

export type FocusAfterRemove = 'input' | 'previous' | 'next';

export interface TagInputContextValue {
  value: string[];
  tags: TagInputTag[];
  delimiters: string[];
  disabled: boolean;
  add: (values: string[]) => void;
  remove: (value: string, focusAfter: FocusAfterRemove) => void;
  focusInput: () => void;
  focusTag: (value: string | undefined) => void;
  registerInput: (element: HTMLInputElement | null) => void;
  registerTag: (value: string, element: HTMLElement | null) => void;
  onTagExited: (value: string) => void;
}

export const TagInputContext = createContext<TagInputContextValue | null>(null);

export function useTagInputContext(): TagInputContextValue {
  const ctx = useContext(TagInputContext);
  if (!ctx) {
    throw new Error('TagInput compound components must be used within <TagInput.Root>');
  }
  return ctx;
}

export function useTagInput(): Pick<TagInputContextValue, 'value' | 'tags' | 'disabled' | 'add' | 'remove'> {
  const { value, tags, disabled, add, remove } = useTagInputContext();
  return { value, tags, disabled, add, remove };
}

export const TagContext = createContext<string | null>(null);

export function useTagValue(): string {
  const value = useContext(TagContext);
  if (value === null) {
    throw new Error('<TagInput.TagRemove> must be used within <TagInput.Tag>');
  }
  return value;
}

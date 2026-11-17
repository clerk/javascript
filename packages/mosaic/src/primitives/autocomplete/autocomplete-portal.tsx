'use client';

import type { ReactNode } from 'react';

import { Portal } from '../portal';
import { useAutocompleteContext } from './autocomplete-context';

export interface AutocompletePortalProps {
  children: ReactNode;
  root?: HTMLElement | null | React.RefObject<HTMLElement | null>;
}

export function AutocompletePortal(props: AutocompletePortalProps) {
  const { mounted } = useAutocompleteContext();
  if (!mounted) {
    return null;
  }
  return <Portal root={props.root}>{props.children}</Portal>;
}

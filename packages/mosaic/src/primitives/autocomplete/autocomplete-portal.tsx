'use client';

import { FloatingPortal } from '@floating-ui/react';
import type { ReactNode } from 'react';

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
  return <FloatingPortal root={props.root}>{props.children}</FloatingPortal>;
}

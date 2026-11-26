import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

import { Button } from '../../components/button';
import { ghostAction } from '../../styles/ghost-action.styles';
import { styles } from './verification.styles';

export interface VerificationLink {
  label: string;
  onClick: () => void;
  variant?: 'outline' | 'ghost';
}

export function VerificationLinks({
  links,
  prompt,
  disabled = false,
}: {
  links: readonly VerificationLink[];
  prompt?: ReactNode;
  disabled?: boolean;
}) {
  if (links.length === 0 && !prompt) {
    return null;
  }
  return (
    <div {...stylex.props(styles.actions)}>
      {links.map((link, index) => (
        <Button
          key={link.label}
          type='button'
          variant={link.variant ?? 'ghost'}
          color='neutral'
          fullWidth
          disabled={disabled}
          xstyle={
            !prompt && index === links.length - 1 && (link.variant ?? 'ghost') === 'ghost'
              ? ghostAction.trailing
              : undefined
          }
          onClick={link.onClick}
        >
          {link.label}
        </Button>
      ))}
      {prompt}
    </div>
  );
}

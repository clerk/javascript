import * as stylex from '@stylexjs/stylex';
import type { ReactElement, Ref } from 'react';

import { Button } from '../../components/button';
import { Card, useCardActions } from '../../components/card';
import { ghostAction } from '../../styles/ghost-action.styles';
import { styles } from './verification.styles';

export type VerificationLayout = 'inline' | 'stacked';

/** The layout a verification step takes: the one passed, or the one its card gives its actions. */
export function useVerificationLayout(layout?: VerificationLayout): VerificationLayout {
  const cardActions = useCardActions();
  return layout ?? (cardActions === 'stacked' ? 'stacked' : 'inline');
}

interface VerificationActionsProps {
  layout?: VerificationLayout;
  primary?: ReactElement;
  secondaryLabel: string;
  onSecondary?: () => void;
  disabled?: boolean;
  secondaryRef?: Ref<HTMLButtonElement>;
}

export function VerificationActions({
  layout: layoutProp,
  primary,
  secondaryLabel,
  onSecondary,
  disabled = false,
  secondaryRef,
}: VerificationActionsProps) {
  const layout = useVerificationLayout(layoutProp);
  const secondary = onSecondary ? (
    <Button
      ref={secondaryRef}
      type='button'
      variant={layout === 'stacked' ? 'ghost' : 'outline'}
      color='neutral'
      size={layout === 'stacked' ? undefined : 'md'}
      fullWidth={layout === 'stacked' || undefined}
      xstyle={layout === 'stacked' ? ghostAction.trailing : undefined}
      disabled={disabled}
      onClick={onSecondary}
    >
      {secondaryLabel}
    </Button>
  ) : null;

  if (!primary && !secondary) {
    return null;
  }

  if (layout === 'stacked') {
    return (
      <div {...stylex.props(styles.actions)}>
        {primary}
        {secondary}
      </div>
    );
  }

  return (
    <Card.Footer>
      {secondary}
      {primary}
    </Card.Footer>
  );
}

import type { ReactNode, Ref } from 'react';

import { Button } from '../../components/button';
import { Text } from '../../components/text';
import { ghostAction } from '../../styles/ghost-action.styles';
import { styles } from './prompt.styles';

interface PromptProps {
  text: ReactNode;
  action: ReactNode;
  onAction?: () => void;
  disabled?: boolean;
  actionRef?: Ref<HTMLButtonElement>;
  variant?: 'ghost' | 'outline';
}

export function Prompt({ text, action, onAction, disabled = false, actionRef, variant = 'ghost' }: PromptProps) {
  if (text === '' || text == null) {
    return (
      <Button
        ref={actionRef}
        type='button'
        variant={variant}
        color='neutral'
        fullWidth
        disabled={disabled}
        xstyle={variant === 'ghost' ? ghostAction.trailing : undefined}
        onClick={onAction}
      >
        {action}
      </Button>
    );
  }
  return (
    <Text
      size='sm'
      color='foreground-secondary'
      xstyle={styles.root}
    >
      {text}{' '}
      <Button
        ref={actionRef}
        type='button'
        variant='link'
        color='neutral'
        size='md'
        fullWidth={false}
        disabled={disabled}
        onClick={onAction}
      >
        {action}
      </Button>
    </Text>
  );
}

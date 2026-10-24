import * as stylex from '@stylexjs/stylex';

import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Text } from '../../../components/text';
import { truncationStyles } from '../../../styles/typography.styles';
import { styles } from '../sign-in.styles';

export interface SignInIdentityPreviewProps {
  identifier: string;
  editLabel: string;
  disabled?: boolean;
  onEdit?: () => void;
}

export function SignInIdentityPreview({ identifier, editLabel, disabled = false, onEdit }: SignInIdentityPreviewProps) {
  return (
    <div {...stylex.props(styles.identity)}>
      <Text
        size='sm'
        color='foreground-secondary'
        xstyle={[styles.identityText, truncationStyles.singleLine]}
      >
        {identifier}
      </Text>
      {onEdit ? (
        <Button
          type='button'
          variant='ghost'
          shape='circle'
          size='xs'
          aria-label={editLabel}
          disabled={disabled}
          onClick={onEdit}
        >
          <Icon name='pen' />
        </Button>
      ) : null}
    </div>
  );
}

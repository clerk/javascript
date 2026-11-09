import * as stylex from '@stylexjs/stylex';

import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Icon } from '../../../components/icon';
import { Pen } from '../../../icons/glyphs/pen';
import { truncationStyles } from '../../../styles/typography.styles';
import { styles } from '../sign-in.styles';

interface SignInIdentityPreviewProps {
  identifier: string;
  editLabel: string;
  disabled?: boolean;
  onEdit?: () => void;
}

export function SignInIdentityPreview({ identifier, editLabel, disabled = false, onEdit }: SignInIdentityPreviewProps) {
  return (
    <Card.Description xstyle={styles.identity}>
      <span {...stylex.props(styles.identityText, truncationStyles.singleLine)}>{identifier}</span>
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
          <Icon glyph={Pen} />
        </Button>
      ) : null}
    </Card.Description>
  );
}

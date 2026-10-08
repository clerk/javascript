import { Button, descriptors, Icon } from '../../customizables';
import { Checkmark, Copy } from '../../icons';
import type { StatementCopyButtonData } from './statements.types';

export const StatementCopyButtonView = ({ onCopy, hasCopied, copyLabel }: StatementCopyButtonData) => {
  return (
    <Button
      elementDescriptor={descriptors.statementCopyButton}
      variant='unstyled'
      onClick={onCopy}
      sx={t => ({
        color: 'inherit',
        width: t.sizes.$4,
        height: t.sizes.$4,
        padding: 0,
        borderRadius: t.radii.$sm,
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: t.colors.$colorRing,
        },
      })}
      focusRing={false}
      aria-label={hasCopied ? 'Copied' : copyLabel}
    >
      <Icon
        size='sm'
        icon={hasCopied ? Checkmark : Copy}
        aria-hidden
      />
    </Button>
  );
};

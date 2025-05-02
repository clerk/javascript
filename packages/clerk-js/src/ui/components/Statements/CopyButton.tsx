import { Button, descriptors, Icon } from 'ui/customizables';

import { useClipboard } from '../../hooks';
import { Check, Copy } from '../../icons';

type CopyButtonProps = {
  /**
   * The text to copy.
   */
  text: string;
  /**
   * An accessible label for the copy button.
   */
  copyLabel?: string;
};

export function CopyButton({ text, copyLabel = 'Copy' }: CopyButtonProps) {
  const { onCopy, hasCopied } = useClipboard(text);

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
          outlineColor: t.colors.$neutralAlpha200,
        },
      })}
      focusRing={false}
      aria-label={hasCopied ? 'Copied' : copyLabel}
    >
      <Icon
        size='sm'
        icon={hasCopied ? Check : Copy}
        aria-hidden
      />
    </Button>
  );
}

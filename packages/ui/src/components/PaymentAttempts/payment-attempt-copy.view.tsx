import { Button, descriptors, Icon } from '../../customizables';
import { Checkmark, Copy } from '../../icons';
import type { PaymentAttemptCopyData } from './payment-attempt.types';

export const PaymentAttemptCopyView = ({ copyLabel, hasCopied, onCopy }: PaymentAttemptCopyData) => (
  <Button
    elementDescriptor={descriptors.paymentAttemptCopyButton}
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

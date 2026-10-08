import { useClipboard } from '../../hooks';
import { PaymentAttemptCopyView } from './payment-attempt-copy.view';

export const PaymentAttemptCopy = ({ text, copyLabel }: { text: string; copyLabel: string }) => {
  const { hasCopied, onCopy } = useClipboard(text);
  return (
    <PaymentAttemptCopyView
      hasCopied={hasCopied}
      onCopy={() => onCopy()}
      copyLabel={copyLabel}
    />
  );
};

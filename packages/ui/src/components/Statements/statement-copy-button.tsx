import { useClipboard } from '../../hooks';
import { StatementCopyButtonView } from './statement-copy-button.view';

export const StatementCopyButton = ({ text, copyLabel = 'Copy' }: { text: string; copyLabel?: string }) => {
  const { hasCopied, onCopy } = useClipboard(text);
  return (
    <StatementCopyButtonView
      hasCopied={hasCopied}
      onCopy={() => onCopy()}
      copyLabel={copyLabel}
    />
  );
};

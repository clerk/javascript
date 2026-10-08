import { useClipboard } from '@/hooks';

import type { useFullMessageBlockModel } from './full-message-block.model';

export const useFullMessageBlockController = (message: string, model: ReturnType<typeof useFullMessageBlockModel>) => {
  const { onCopy, hasCopied } = useClipboard(message);
  return { onCopy, hasCopied, copyLabel: hasCopied ? model.copiedLabel : model.copyLabel };
};

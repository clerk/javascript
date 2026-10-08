import { useClipboard } from '@/hooks';

export const useMicrosoftClaimNameCellController = (claimName: string) => {
  const { onCopy, hasCopied } = useClipboard(claimName);
  return { onCopy, hasCopied };
};

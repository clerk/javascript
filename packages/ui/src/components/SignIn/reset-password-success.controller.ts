import { useCardState } from '@/ui/elements/contexts';

export const useResetPasswordSuccessController = () => {
  const { error } = useCardState();
  return { error };
};

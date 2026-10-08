import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import type { useUVFactorOnePasskeysModel } from './uv-factor-one-passkeys.model';

export const useUVFactorOnePasskeysController = (model: ReturnType<typeof useUVFactorOnePasskeysModel>) => {
  const card = useCardState();

  const handlePasskeysAttempt = () => {
    model.verifyWithPasskey()?.catch(error => handleError(error, [], card.setError));
    return;
  };

  return { error: card.error, handlePasskeysAttempt };
};

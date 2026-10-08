import React from 'react';

import { useCardState } from '@/ui/elements/contexts';

import type { useSignInFactorOnePasskeyModel } from './sign-in-factor-one-passkey.model';
import { useSignInPasskeyController } from './sign-in-passkey.controller';

type SignInFactorOnePasskeyModel = ReturnType<typeof useSignInFactorOnePasskeyModel>;

export function useSignInFactorOnePasskeyController(model: SignInFactorOnePasskeyModel) {
  const card = useCardState();
  const { authenticateWithPasskey } = useSignInPasskeyController(model);
  const [showHavingTrouble, setShowHavingTrouble] = React.useState(false);
  const toggleHavingTrouble = React.useCallback(() => setShowHavingTrouble(value => !value), []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    return authenticateWithPasskey();
  };

  return {
    identifier: model.identifier,
    avatarUrl: model.avatarUrl,
    error: card.error,
    goBack: model.goBack,
    showHavingTrouble,
    toggleHavingTrouble,
    handleSubmit,
  };
}

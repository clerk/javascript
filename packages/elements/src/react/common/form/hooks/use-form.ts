import { useCallback } from 'react';
import type { BaseActorRef } from 'xstate';

import { useGlobalErrors } from './use-global-errors';

/**
 * Provides the form submission handler along with the form's validity via a data attribute
 */
export function useForm({ flowActor }: { flowActor?: BaseActorRef<{ type: 'SUBMIT'; action: 'submit' }> }) {
  const { errors } = useGlobalErrors();

  // Register the onSubmit handler for form submission
  // TODO: merge user-provided submit handler
  const onSubmit = useCallback(
    (event: React.FormEvent<Element>) => {
      event.preventDefault();
      if (flowActor) {
        flowActor.send({ type: 'SUBMIT', action: 'submit' });
      }
    },
    [flowActor],
  );

  return {
    props: {
      ...(errors.length > 0 ? { 'data-global-error': true } : {}),
      onSubmit,
    },
  };
}

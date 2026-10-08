import { useEffect, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { localizationKeys } from '../../customizables';
import type { WaitlistModel } from './waitlist.model';

export function useWaitlistController(model: WaitlistModel) {
  const [successOwner, setSuccessOwner] = useState<object>();
  const card = useCardState();
  const emailAddress = useFormControl('emailAddress', model.initialEmailAddress, {
    type: 'email',
    label: localizationKeys('formFieldLabel__emailAddress'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
  });
  const latest = useRef({ model, card, emailAddress });
  latest.current = { model, card, emailAddress };
  const current = useRef({
    key: model.requestKey,
    generation: {},
    succeeded: false,
    pending: undefined as Promise<void> | undefined,
    timer: undefined as number | undefined,
  });
  if (current.current.key !== model.requestKey) {
    current.current = { key: model.requestKey, generation: {}, succeeded: false, pending: undefined, timer: undefined };
  }
  const owner = current.current;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      owner.generation = {};
      owner.pending = undefined;
      if (owner.timer !== undefined) {
        window.clearTimeout(owner.timer);
        owner.timer = undefined;
      }
    };
  }, [owner]);
  const canRun = () => mounted.current && current.current === owner && latest.current.model.canRun();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canRun() || owner.succeeded) {
      return Promise.resolve();
    }
    if (owner.pending) {
      return owner.pending;
    }
    const source = latest.current.model;
    const input = latest.current.emailAddress.value;
    const origin = owner.generation;
    const isCurrent = () => canRun() && owner.generation === origin;
    latest.current.card.setError(undefined);
    const pending = Promise.resolve()
      .then(() => {
        if (!isCurrent()) {
          return false;
        }
        return source.join(input, isCurrent);
      })
      .then(completed => {
        if (!completed || !isCurrent()) {
          return;
        }
        owner.succeeded = true;
        latest.current.card.setError(undefined);
        setSuccessOwner(owner);
        if (source.hasAfterJoinWaitlistUrl) {
          owner.timer = window.setTimeout(() => {
            owner.timer = undefined;
            if (isCurrent()) {
              latest.current.model.navigateAfterJoin(isCurrent);
            }
          }, 2000);
        }
      })
      .catch(error => {
        if (isCurrent()) {
          handleError(error as Error, [latest.current.emailAddress], latest.current.card.setError);
        }
      })
      .finally(() => {
        if (owner.pending === pending) {
          owner.pending = undefined;
        }
      });
    owner.pending = pending;
    return pending;
  };

  return {
    step: successOwner === owner ? 1 : 0,
    emailAddressProps: emailAddress.props,
    error: card.error,
    onSubmit,
  };
}

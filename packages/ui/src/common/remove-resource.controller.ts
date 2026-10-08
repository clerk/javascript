import { useEffect, useRef } from 'react';

import { useCardState } from '../elements/contexts';
import { handleError } from '../utils/errorHandler';
import type { RemoveFormData, RemoveResourceData, RemoveResourceModel } from './remove-resource.types';

export const useRemoveResourceController = (model: RemoveResourceModel, props: RemoveFormData): RemoveResourceData => {
  const card = useCardState();
  const current = useRef({ scopeKey: model.scopeKey, generation: {}, pending: undefined as Promise<void> | undefined });
  if (current.current.scopeKey !== model.scopeKey) {
    current.current = { scopeKey: model.scopeKey, generation: {}, pending: undefined };
  }
  const owner = current.current;
  const latest = useRef({ model, props, card });
  latest.current = { model, props, card };
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      owner.generation = {};
      owner.pending = undefined;
    };
  }, [owner]);
  const canRun = () => mounted.current && current.current === owner && latest.current.model.canRun();

  const handleSubmit = (): Promise<void> => {
    if (!canRun()) {
      return Promise.resolve();
    }
    if (owner.pending) {
      return owner.pending;
    }
    const generation = owner.generation;
    const isCurrent = () => canRun() && owner.generation === generation;
    latest.current.card.setError(undefined);
    const pending = Promise.resolve()
      .then(() => (isCurrent() ? latest.current.model.deleteResource(isCurrent) : false))
      .then(completed => {
        if (completed && isCurrent()) {
          latest.current.props.onSuccess();
        }
      })
      .catch(error => {
        if (isCurrent()) {
          handleError(error, [], latest.current.card.setError);
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
    title: props.title,
    messageLine1: props.messageLine1,
    messageLine2: props.messageLine2,
    onReset: () => {
      if (canRun() && !owner.pending) {
        latest.current.props.onReset();
      }
    },
    handleSubmit,
  };
};

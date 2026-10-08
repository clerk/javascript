import { warnings } from '@clerk/shared/internal/clerk-js/warnings';
import { isDevelopmentFromPublishableKey } from '@clerk/shared/keys';
import type { SessionTask } from '@clerk/shared/types';
import { useEffect, useRef } from 'react';

import type { useTaskGuardOnlyOnMountModel } from './task-guard-only-on-mount.model';

export const useTaskGuardOnlyOnMountController = (
  model: ReturnType<typeof useTaskGuardOnlyOnMountModel>,
  taskKey: SessionTask['key'],
) => {
  const shouldRedirectOnMount = useRef<boolean | null>(null);

  if (shouldRedirectOnMount.current === null) {
    shouldRedirectOnMount.current =
      !model.currentTaskKey || (model.currentTaskKey !== taskKey && !model.setActiveInProgress);
  }

  const modelRef = useRef(model);
  modelRef.current = model;
  useEffect(() => {
    if (shouldRedirectOnMount.current) {
      const currentModel = modelRef.current;
      if (isDevelopmentFromPublishableKey(currentModel.publishableKey)) {
        console.info(warnings.cannotRenderComponentWhenTaskDoesNotExist);
      }
      void currentModel.redirect();
    }
  }, []);

  return { shouldRedirect: shouldRedirectOnMount.current };
};

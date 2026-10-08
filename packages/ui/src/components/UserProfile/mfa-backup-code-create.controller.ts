import { useEffect, useRef } from 'react';

import { useAppearance } from '@/ui/customizables';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import type { MfaBackupCodeCreateFormProps, useMfaBackupCodeCreateModel } from './mfa-backup-code-create.model';

export const useMfaBackupCodeCreateController = (
  model: ReturnType<typeof useMfaBackupCodeCreateModel>,
  props: MfaBackupCodeCreateFormProps,
) => {
  const card = useCardState();
  const { autoFocus } = useAppearance().parsedOptions;
  const mounted = useRef(true);
  const generation = useRef({});
  const latestProps = useRef(props);
  latestProps.current = props;
  const current = useRef({ key: model.requestKey });
  if (current.current.key !== model.requestKey) {
    current.current = { key: model.requestKey };
  }
  const owner = current.current;
  const canRun = () => mounted.current && current.current === owner && model.canRun();
  const start = () => {
    const origin = generation.current;
    const isCurrent = () => canRun() && generation.current === origin;
    if (!isCurrent()) {
      return;
    }
    void model.createBackupCodeData().catch(error => {
      if (!isCurrent()) {
        return;
      }
      if (model.isCancellation(error)) {
        return latestProps.current.onReset();
      }
      handleError(error, [], card.setError);
    });
  };
  const startOnMount = useRef(start);
  startOnMount.current = start;
  useEffect(() => {
    mounted.current = true;
    startOnMount.current();
    return () => {
      mounted.current = false;
      generation.current = {};
    };
  }, [model.requestKey]);

  return {
    hasError: !!card.error,
    backupCode: model.backupCode,
    autoFocus,
    onSuccess: () => {
      if (canRun() && model.backupCode) {
        props.onSuccess();
      }
    },
  };
};

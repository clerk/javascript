import { useCallback, useEffect, useRef, useState } from 'react';

import { useCardState } from '@/elements/contexts';
import { handleError } from '@/utils/errorHandler';

import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import type { useConfigureStepModel } from './configure-step.model';

type RequestKind = 'create' | 'rotate' | 'continue';
type PendingRequest = { release: () => void; kind: RequestKind; directoryVersion: number };

export const useConfigureStepController = (model: ReturnType<typeof useConfigureStepModel>) => {
  const { goNext } = useWizard();
  const card = useCardState();
  const mounted = useRef(true);
  const connection = useRef({ key: model.requestKey, version: 0 });
  if (connection.current.key !== model.requestKey) {
    connection.current = { key: model.requestKey, version: connection.current.version + 1 };
  }
  const directory = useRef({ key: model.directoryKey, version: 0 });
  if (directory.current.key !== model.directoryKey) {
    directory.current = { key: model.directoryKey, version: directory.current.version + 1 };
  }
  const connectionVersion = connection.current.version;
  const directoryVersion = directory.current.version;
  const { canRun, canProvision, directory: directoryData } = model;
  const isConnectionCurrent = useCallback(
    () => mounted.current && connection.current.version === connectionVersion && canRun(),
    [connectionVersion, canRun],
  );
  const isDirectoryCurrent = () => isConnectionCurrent() && directory.current.version === directoryVersion;
  const inputs = useRef(model);
  inputs.current = model;
  const pending = useRef<PendingRequest | null>(null);
  const [instructions, setInstructions] = useState({ version: connectionVersion, isOpen: false });
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const request = pending.current;
      pending.current = null;
      request?.release();
    };
  }, [model.requestKey]);
  useEffect(() => {
    const request = pending.current;
    if (request && request.kind !== 'create' && request.directoryVersion !== directoryVersion) {
      pending.current = null;
      request.release();
    }
  }, [directoryVersion]);

  const run = async (kind: RequestKind): Promise<void> => {
    const isCurrent = kind === 'create' ? isConnectionCurrent : isDirectoryCurrent;
    if (
      !isCurrent() ||
      pending.current ||
      !inputs.current.canProvision ||
      (kind === 'create' ? inputs.current.directory !== null : !inputs.current.directory) ||
      (kind === 'continue' && !inputs.current.credentials.canContinue)
    ) {
      return;
    }
    const release = card.beginRequest();
    if (!release) {
      return;
    }
    const request = { release, kind, directoryVersion };
    pending.current = request;
    card.setError(undefined);
    const isRequestCurrent = () => isCurrent() && pending.current === request;
    try {
      if (kind === 'create') {
        await inputs.current.createDirectory();
      } else if (kind === 'rotate') {
        await inputs.current.rotateToken();
      } else if (await inputs.current.credentials.submit()) {
        if (isRequestCurrent()) {
          goNext();
        }
      }
    } catch (err) {
      if (isRequestCurrent()) {
        handleError(err as Error, [], card.setError);
      }
    } finally {
      if (pending.current === request) {
        pending.current = null;
        release();
      }
    }
  };
  const createOnEntry = useRef(() => run('create'));
  createOnEntry.current = () => run('create');

  // The credentials only exist once the directory does, so create it on entry.
  const hasAttemptedCreate = useRef<number | null>(null);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (
        !active ||
        !canProvision ||
        directoryData !== null ||
        hasAttemptedCreate.current === connectionVersion ||
        !isConnectionCurrent()
      ) {
        return;
      }
      hasAttemptedCreate.current = connectionVersion;
      void createOnEntry.current();
    });
    return () => {
      active = false;
    };
  }, [canProvision, directoryData, connectionVersion, isConnectionCurrent]);

  return {
    error: card.error,
    isLoading: card.isLoading,
    isInstructionsOpen: instructions.version === connectionVersion && instructions.isOpen,
    toggleInstructions: () => {
      if (isConnectionCurrent()) {
        setInstructions(previous => ({
          version: connectionVersion,
          isOpen: previous.version === connectionVersion ? !previous.isOpen : true,
        }));
      }
    },
    generateToken: () => run('rotate'),
    retryCreateDirectory: () => run('create'),
    onContinue: async (): Promise<void> => {
      if (
        !isDirectoryCurrent() ||
        !inputs.current.directory ||
        !inputs.current.canProvision ||
        pending.current ||
        card.isLoading
      ) {
        return;
      }
      if (inputs.current.isPull) {
        await run('continue');
      } else {
        goNext();
      }
    },
  };
};

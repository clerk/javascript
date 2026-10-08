import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  ConfigureDirectorySyncData,
  ConfigureDirectorySyncModel,
  DirectorySyncToken,
} from './configure-directory-sync.types';

export const useConfigureDirectorySyncContextController = (
  model: ConfigureDirectorySyncModel,
  onExit?: () => void,
): ConfigureDirectorySyncData => {
  const mounted = useRef(true);
  const closedVersion = useRef<number | null>(null);
  const pending = useRef<{ kind: 'create' | 'rotate'; directoryVersion: number } | null>(null);
  const identity = JSON.stringify([model.requestKey, model.enterpriseConnectionId]);
  const scope = useRef({ identity, version: 0 });
  if (scope.current.identity !== identity) {
    scope.current = { identity, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const { canRun, canRunDirectory: sourceCanRunDirectory } = model;
  const isCurrent = useCallback(
    () => mounted.current && scope.current.version === version && closedVersion.current !== version && canRun(),
    [version, canRun],
  );
  const directoryIdentity = JSON.stringify([model.directoryKey, model.directory?.id]);
  const directory = useRef({ identity: directoryIdentity, id: model.directory?.id, version: 0 });
  if (directory.current.identity !== directoryIdentity) {
    directory.current = {
      identity: directoryIdentity,
      id: model.directory?.id,
      version: directory.current.version + 1,
    };
  }
  const directoryVersion = directory.current.version;
  const canRunDirectory = useCallback(
    () => isCurrent() && directory.current.version === directoryVersion && sourceCanRunDirectory(),
    [isCurrent, directoryVersion, sourceCanRunDirectory],
  );
  const [revealed, setRevealed] = useState<{
    version: number;
    directoryVersion: number;
    awaitingDirectory: boolean;
    token: DirectorySyncToken;
  } | null>(null);
  if (revealed) {
    if (revealed.version !== version || !isCurrent()) {
      setRevealed(null);
    } else if (revealed.awaitingDirectory && model.directory?.id === revealed.token.directoryId) {
      setRevealed({ ...revealed, directoryVersion, awaitingDirectory: false });
    } else if (revealed.directoryVersion !== directoryVersion) {
      setRevealed(null);
    }
  }
  const {
    createDirectory: create,
    rotateToken: rotate,
    setDirectoryEnabled: setEnabled,
    setCredentials: setSourceCredentials,
    syncDirectory: sync,
  } = model;
  const revealedToken =
    isCurrent() &&
    revealed?.version === version &&
    !revealed.awaitingDirectory &&
    revealed.directoryVersion === directoryVersion &&
    revealed.token.enterpriseConnectionId === model.enterpriseConnectionId &&
    revealed.token.directoryId === model.directory?.id
      ? revealed.token.token
      : null;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current = null;
    };
  }, [identity]);
  const requestToken = useCallback(
    async (request: () => Promise<DirectorySyncToken | null>, kind: 'create' | 'rotate') => {
      if (!isCurrent() || (kind === 'rotate' && !canRunDirectory())) {
        return;
      }
      if (pending.current?.kind === 'rotate' && pending.current.directoryVersion !== directory.current.version) {
        pending.current = null;
      }
      if (pending.current) {
        return;
      }
      const requestDirectoryVersion = directory.current.version;
      const requestOwner = { kind, directoryVersion: requestDirectoryVersion };
      pending.current = requestOwner;
      const isRequestCurrent = () =>
        isCurrent() &&
        pending.current === requestOwner &&
        (kind === 'create' || (directory.current.version === requestDirectoryVersion && canRunDirectory()));
      try {
        const token = await request();
        if (
          isRequestCurrent() &&
          token?.enterpriseConnectionId === model.enterpriseConnectionId &&
          (!directory.current.id || directory.current.id === token.directoryId)
        ) {
          setRevealed({
            version,
            token,
            directoryVersion: directory.current.version,
            awaitingDirectory: directory.current.id !== token.directoryId,
          });
        }
      } catch (error) {
        if (isRequestCurrent()) {
          throw error;
        }
      } finally {
        if (pending.current === requestOwner) {
          pending.current = null;
        }
      }
    },
    [isCurrent, canRunDirectory, model.enterpriseConnectionId, version],
  );
  const createDirectory = useCallback(() => requestToken(create, 'create'), [requestToken, create]);
  const rotateToken = useCallback(() => requestToken(rotate, 'rotate'), [requestToken, rotate]);
  const runDirectoryCommand = useCallback(
    async (request: () => Promise<void>) => {
      if (!canRunDirectory()) {
        return;
      }
      try {
        await request();
      } catch (error) {
        if (canRunDirectory()) {
          throw error;
        }
      }
    },
    [canRunDirectory],
  );
  const setDirectoryEnabled = useCallback(
    (enabled: boolean) => runDirectoryCommand(() => setEnabled(enabled)),
    [runDirectoryCommand, setEnabled],
  );
  const setCredentials = useCallback(
    (params: Parameters<ConfigureDirectorySyncData['setCredentials']>[0]) =>
      runDirectoryCommand(() => setSourceCredentials(params)),
    [runDirectoryCommand, setSourceCredentials],
  );
  const syncDirectory = useCallback(() => runDirectoryCommand(sync), [runDirectoryCommand, sync]);
  return {
    ...model,
    canRun: isCurrent,
    canRunDirectory,
    revealedToken,
    createDirectory,
    rotateToken,
    setDirectoryEnabled,
    setCredentials,
    syncDirectory,
    onExit: onExit
      ? () => {
          if (isCurrent()) {
            closedVersion.current = version;
            pending.current = null;
            setRevealed(null);
            onExit();
          }
        }
      : undefined,
  };
};

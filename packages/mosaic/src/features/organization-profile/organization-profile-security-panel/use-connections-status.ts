import { useState } from 'react';

export interface ConnectionsStatus {
  isLoading: boolean;
  isError: boolean;
}

export function useConnectionsStatus(connections: {
  data: unknown[] | undefined;
  error: Error | null;
  isLoading: boolean;
}): ConnectionsStatus {
  const [failed, setFailed] = useState(false);
  const isFailing = Boolean(connections.error) && !connections.data;
  if (isFailing && !failed) {
    setFailed(true);
  }
  if (connections.data && failed) {
    setFailed(false);
  }
  const isError = isFailing || (failed && !connections.data);
  return { isLoading: connections.isLoading && !isError, isError };
}

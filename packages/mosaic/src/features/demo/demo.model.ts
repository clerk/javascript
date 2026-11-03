import { useSession } from '@clerk/shared/react';

import { useDemoQuery, useUpdateDemo } from '../../queries/use-demo-query';
import { save } from '../../utils/errors';
import type { DemoModel } from './demo.types';

export function useDemoModel(): DemoModel {
  const { session, isLoaded } = useSession();
  const query = useDemoQuery();
  const update = useUpdateDemo();

  if (!isLoaded) {
    return { status: 'loading' };
  }
  if (!session) {
    return { status: 'hidden' };
  }
  if (query.isLoading) {
    return { status: 'loading' };
  }
  if (!query.data) {
    return { status: 'error' };
  }

  return {
    status: 'ready',
    identity: session.id,
    instance: query.data,
    isRefreshing: query.isFetching,
    refreshFailed: Boolean(query.error),
    onSave: values => save(() => update.mutateAsync(values), ['name']),
  };
}

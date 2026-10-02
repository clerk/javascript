import { useMessages } from '../../localization';
import { resolveAPIKeysTableMessages } from './api-keys-table.messages';
import { APIKeysTableView, placeholderAPIKeys } from './api-keys-table.view';

const PLACEHOLDER_API_KEYS = placeholderAPIKeys(3);

const noop = () => undefined;

export function APIKeysTableSkeleton() {
  const messages = resolveAPIKeysTableMessages(useMessages('apiKeysTable'), 'user');

  return (
    <APIKeysTableView
      skeleton
      messages={messages}
      apiKeys={PLACEHOLDER_API_KEYS}
      totalCount={PLACEHOLDER_API_KEYS.length}
      page={1}
      searchValue=''
      isLoading={false}
      onPageChange={noop}
      onSearchChange={noop}
      onCreate={noop}
      onRevoke={() => Promise.resolve()}
    />
  );
}

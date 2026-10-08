import { type APIKeysTableProps, useAPIKeysTableModel } from './api-keys-table.model';
import { APIKeysTableView } from './api-keys-table.view';

export const APIKeysTable = (props: APIKeysTableProps) => {
  const model = useAPIKeysTableModel(props);
  return <APIKeysTableView {...model} />;
};

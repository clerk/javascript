import { useRequestToJoinListController } from './request-to-join-list.controller';
import { useRequestToJoinListModel } from './request-to-join-list.model';
import type { RequestToJoinListModel } from './request-to-join-list.types';
import { RequestRowView, RequestToJoinListView } from './request-to-join-list.view';

export const RequestToJoinList = () => {
  const model = useRequestToJoinListModel();
  return model.hasOrganization ? (
    <List
      key={model.scope}
      model={model}
    />
  ) : null;
};

const List = ({ model }: { model: RequestToJoinListModel }) => {
  const data = useRequestToJoinListController(model);
  return (
    <RequestToJoinListView
      table={data.table}
      rows={data.requests.map(row => (
        <RequestRowView
          key={row.id}
          data={row.view}
          controller={row.interaction}
        />
      ))}
    />
  );
};

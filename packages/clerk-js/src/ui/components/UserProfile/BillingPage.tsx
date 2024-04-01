import { useUser } from '@clerk/shared/react';

import { Col } from '../../customizables';
import { withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';

export const BillingPage = withCardStateProvider(() => {
  const { user } = useUser();

  const { data, isLoading } = useFetch(user?.getAvailablePlans, {});

  if (isLoading) {
    return <div>Loading</div>;
  }

  if ((data?.data.length || 0) < 1) {
    return <>No data</>;
  }

  return (
    <Col>
      {data?.data.map(({ name, id }) => {
        return <li key={id}>{name}</li>;
      })}
    </Col>
  );
});

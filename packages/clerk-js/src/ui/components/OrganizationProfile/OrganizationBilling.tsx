import { useOrganization } from '@clerk/shared/react';

import { useFetch } from '../../hooks';

export const OrganizationBilling = () => {
  const { organization } = useOrganization();

  const { data, isLoading } = useFetch(organization?.getAvailablePlans, {});
  console.log(data, isLoading);

  if (isLoading) {
    return <div>Loading</div>;
  }

  if ((data?.data.length || 0) < 1) {
    return <>No data</>;
  }

  const plan = data?.data.map(({ name, id }) => {
    return <li key={id}>{name}</li>;
  });

  return plan;
};

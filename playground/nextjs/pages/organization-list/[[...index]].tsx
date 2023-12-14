import { OrganizationList } from '@clerk/nextjs';
import type { NextPage } from 'next';

const OrganizationListPage: NextPage = () => {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}
    >
      <OrganizationList />
    </div>
  );
};

export default OrganizationListPage;

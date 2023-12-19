import { CreateOrganization } from '@clerk/nextjs';
import type { NextPage } from 'next';

const CreateOrganizationPage: NextPage = () => {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}
    >
      <CreateOrganization path='/create-organization' />
    </div>
  );
};

export default CreateOrganizationPage;

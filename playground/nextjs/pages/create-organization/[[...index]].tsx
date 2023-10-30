import { CreateOrganization } from '@clerk/nextjs';
import type { NextPage } from 'next';
import React from 'react';

const CreateOrganizationPage: NextPage = () => {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}
    >
      <CreateOrganization path='/' routing='virtual' />
    </div>
  );
};

export default CreateOrganizationPage;

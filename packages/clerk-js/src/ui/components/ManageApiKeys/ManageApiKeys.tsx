import { useClerk } from '@clerk/shared/react';
import { useEffect } from 'react';

// import { useManageApiKeysContext } from '../../contexts';

export const ManageApiKeys = () => {
  const clerk = useClerk();
  // const ctx = useManageApiKeysContext();

  useEffect(() => {
    clerk.getApiKeys().then(apiKeys => {
      console.log(apiKeys);
    });
  }, [clerk]);

  return (
    <div>
      <h1>Manage API Keys</h1>
    </div>
  );
};

import { useEffect } from 'react';

import { useManageApiKeysContext } from '../../contexts';

export const ManageApiKeys = () => {
  const ctx = useManageApiKeysContext();

  useEffect(() => {
    console.log(ctx);
  }, [ctx]);

  return (
    <div>
      <h1>Manage API Keys</h1>
    </div>
  );
};

import { ManageApiKeysContext } from '../../contexts';
import { ManageApiKeys } from '../ManageApiKeys';

export const ApiKeysPage = () => {
  return (
    <ManageApiKeysContext.Provider value={{ componentName: 'ManageApiKeys' }}>
      <ManageApiKeys />
    </ManageApiKeysContext.Provider>
  );
};

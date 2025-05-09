import { ApiKeysContext } from '../../contexts';
import { ApiKeys } from '../ApiKeys';

export const ApiKeysPage = () => {
  return (
    <ApiKeysContext.Provider value={{ componentName: 'ApiKeys' }}>
      <ApiKeys />
    </ApiKeysContext.Provider>
  );
};

import { useConfigureSSO } from '../ConfigureSSOContext';

export const useOpenTestUrlButtonModel = () => {
  const {
    ownerKey,
    canRun,
    enterpriseConnection,
    enterpriseConnectionMutations: { createTestRun },
  } = useConfigureSSO();
  return {
    scopeKey: JSON.stringify([ownerKey, enterpriseConnection?.id]),
    canRun,
    connectionId: enterpriseConnection?.id,
    createTestRun: async (): Promise<string> => {
      if (!enterpriseConnection) {
        return '';
      }
      const result = await createTestRun(enterpriseConnection.id);
      return result?.url || '';
    },
  };
};

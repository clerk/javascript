import { useCallback } from 'react';

import { useStatements } from './Plans';

export const useStatementsContext = () => {
  const { data: statements } = useStatements();
  const getStatementById = useCallback(
    (statementId: string) => {
      return statements?.data.find(statement => statement.id === statementId);
    },
    [statements?.data],
  );

  return {
    getStatementById,
  };
};

import { useCallback } from 'react';

import { useStatements } from './Plans';

export const useStatementsContext = () => {
  const { data: statements } = useStatements();
  const getStatementById = useCallback(
    (statementId: string) => {
      return statements.find(statement => statement.id === statementId);
    },
    [statements],
  );

  return {
    getStatementById,
  };
};

import type { CodeSubmissionCommands } from '@/ui/common/code-verification.types';
import { useCodePreparationController } from '@/ui/common/useCodePreparationController';
import { useCodeSubmissionController } from '@/ui/common/useCodeSubmissionController';
import { useCardState } from '@/ui/elements/contexts';

type CodeModel = CodeSubmissionCommands & {
  prepare?: () => Promise<void>;
};

export { createCodeSubmissionAction as createUVCodeEntryAction } from '@/ui/common/useCodeSubmissionController';

export const useUVCodeController = (model: CodeModel, factorAlreadyPrepared: boolean, onFactorPrepare: () => void) => {
  const { setError } = useCardState();
  const preparation = useCodePreparationController(
    {
      requestKey: model.requestKey,
      canRun: model.canRun,
      shouldAvoidPrepare: !model.prepare,
      shouldAvoidInitialPrepare: factorAlreadyPrepared || !model.prepare,
      prepareRequest: async () => {
        setError(undefined);
        await model.prepare?.();
      },
    },
    onFactorPrepare,
  );
  const action = useCodeSubmissionController(model);
  return { prepare: model.prepare ? preparation.prepare : undefined, action };
};

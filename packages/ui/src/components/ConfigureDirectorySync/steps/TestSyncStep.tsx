import { useTestSyncStepController } from './test-sync-step.controller';
import { useTestSyncStepModel } from './test-sync-step.model';
import { TestSyncStepView } from './test-sync-step.view';

export const TestSyncStep = (): JSX.Element => {
  const model = useTestSyncStepModel();
  const controller = useTestSyncStepController(model);
  return (
    <TestSyncStepView
      {...model}
      {...controller}
    />
  );
};

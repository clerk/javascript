import { type TestRunHowToFixSectionProps, useTestRunHowToFixModel } from './test-run-how-to-fix.model';
import { TestRunHowToFixView } from './test-run-how-to-fix.view';

export const TestRunHowToFixSection = (props: TestRunHowToFixSectionProps): JSX.Element | null => {
  const model = useTestRunHowToFixModel(props);
  if (!model) {
    return null;
  }
  return <TestRunHowToFixView {...model} />;
};

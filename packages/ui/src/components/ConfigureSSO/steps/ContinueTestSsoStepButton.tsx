import { useContinueTestSsoStepButtonController } from './continue-test-sso-step-button.controller';
import { useContinueTestSsoStepButtonModel } from './continue-test-sso-step-button.model';
import { ContinueTestSsoStepButtonView } from './continue-test-sso-step-button.view';

type ContinueTestSsoStepButtonProps = {
  hasSuccessfulTestRun: boolean;
  revalidateHasSuccessfulTestRun: () => Promise<boolean>;
};

export const ContinueTestSsoStepButton = ({
  hasSuccessfulTestRun,
  revalidateHasSuccessfulTestRun,
}: ContinueTestSsoStepButtonProps): JSX.Element => {
  const model = useContinueTestSsoStepButtonModel();
  const controller = useContinueTestSsoStepButtonController(
    hasSuccessfulTestRun,
    revalidateHasSuccessfulTestRun,
    model,
  );
  return <ContinueTestSsoStepButtonView {...controller} />;
};

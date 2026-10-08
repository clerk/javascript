import { Step } from '../elements/Step';
import type { useContinueTestSsoStepButtonController } from './continue-test-sso-step-button.controller';

export const ContinueTestSsoStepButtonView = ({
  handleContinue,
  isLoading,
}: ReturnType<typeof useContinueTestSsoStepButtonController>): JSX.Element => (
  <Step.Footer.Continue
    onClick={handleContinue}
    isLoading={isLoading}
  />
);

import { useCodePreparationController } from '@/ui/common/useCodePreparationController';
import { useCodeSubmissionController } from '@/ui/common/useCodeSubmissionController';

import { useSignUpEmailCodeCardModel } from './sign-up-email-code-card.model';
import { SignUpEmailCodeCardView } from './sign-up-email-code-card.view';

export const SignUpEmailCodeCard = () => {
  const model = useSignUpEmailCodeCardModel();
  const { prepare } = useCodePreparationController(model);
  const action = useCodeSubmissionController(model);

  return (
    <SignUpEmailCodeCardView
      prepare={prepare}
      action={action}
      goBack={model.goBack}
      emailAddress={model.emailAddress}
    />
  );
};

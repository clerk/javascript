import { withCardStateProvider } from '@/ui/elements/contexts';

import { withRedirectToAfterSignUp, withRedirectToSignUpTask } from '../../common';
import { useSignUpStartController } from './sign-up-start.controller';
import { useSignUpStartModel } from './sign-up-start.model';
import { SignUpStartView } from './sign-up-start.view';

function SignUpStartInternal(): JSX.Element {
  const model = useSignUpStartModel();
  return (
    <SignUpStartContent
      key={model.requestKey}
      model={model}
    />
  );
}

function SignUpStartContent({ model }: { model: ReturnType<typeof useSignUpStartModel> }): JSX.Element {
  const controller = useSignUpStartController(model);

  return <SignUpStartView {...controller} />;
}

export const SignUpStart = withRedirectToSignUpTask(
  withRedirectToAfterSignUp(withCardStateProvider(SignUpStartInternal)),
);

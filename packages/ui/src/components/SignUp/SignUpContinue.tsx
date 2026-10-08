import { withCardStateProvider } from '@/ui/elements/contexts';

import { useSignUpContinueController } from './sign-up-continue.controller';
import { useSignUpContinueModel } from './sign-up-continue.model';
import { SignUpContinueView } from './sign-up-continue.view';

const SignUpContinueContent = withCardStateProvider(
  ({ model }: { model: ReturnType<typeof useSignUpContinueModel> }) => {
    const controller = useSignUpContinueController(model);

    return <SignUpContinueView {...controller} />;
  },
);

// TODO: flow / page naming
export const SignUpContinue = () => {
  const model = useSignUpContinueModel();
  return (
    <SignUpContinueContent
      key={model.requestKey}
      model={model}
    />
  );
};

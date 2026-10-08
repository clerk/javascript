import { withCardStateProvider } from '@/elements/contexts';

import { useTotpCodeFlowController } from './totp-code-flow.controller';
import { useTotpCodeFlowModel } from './totp-code-flow.model';
import type { TotpCodeFlowModel } from './totp-code-flow.types';
import { TotpCodeFlowView } from './totp-code-flow.view';

type TOTPCodeFlowProps = {
  onSuccess: () => void;
  goToStartStep: () => void;
};

const TotpCodeFlowContent = withCardStateProvider(
  ({ model, ...props }: TOTPCodeFlowProps & { model: TotpCodeFlowModel }) => {
    const controller = useTotpCodeFlowController(model, props.onSuccess, props.goToStartStep);
    return <TotpCodeFlowView controller={controller} />;
  },
);

export const TOTPCodeFlow = (props: TOTPCodeFlowProps) => {
  const model = useTotpCodeFlowModel();
  return (
    <TotpCodeFlowContent
      key={model.scopeKey}
      model={model}
      {...props}
    />
  );
};

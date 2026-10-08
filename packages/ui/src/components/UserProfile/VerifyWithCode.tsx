import type { VerifyWithCodeProps } from './verification-code.types';
import { useVerifyWithCodeController } from './verify-with-code.controller';
import { VerifyWithCodeView } from './verify-with-code.view';

export const VerifyWithCode = (props: VerifyWithCodeProps) => {
  return (
    <VerifyWithCodeContent
      key={props.requestKey ?? props.identifier}
      {...props}
    />
  );
};

const VerifyWithCodeContent = (props: VerifyWithCodeProps) => {
  const controller = useVerifyWithCodeController(props);

  return <VerifyWithCodeView controller={controller} />;
};

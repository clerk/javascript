import { Flow, localizationKeys } from '../../customizables';
import type { UVFactorTwoCodeCard } from './UVFactorTwoCodeForm';
import { UVFactorTwoCodeForm } from './UVFactorTwoCodeForm';

type UVFactorTwoPhoneCodeCardViewProps = {
  props: UVFactorTwoCodeCard;
  prepare: () => Promise<void>;
};

export const UVFactorTwoPhoneCodeCardView = ({ props, prepare }: UVFactorTwoPhoneCodeCardViewProps) => (
  <Flow.Part part='phoneCode2Fa'>
    <UVFactorTwoCodeForm
      {...props}
      cardTitle={localizationKeys('reverification.phoneCodeMfa.title')}
      cardSubtitle={localizationKeys('reverification.phoneCodeMfa.subtitle')}
      inputLabel={localizationKeys('reverification.phoneCodeMfa.formTitle')}
      resendButton={localizationKeys('reverification.phoneCodeMfa.resendButton')}
      identityPreviewEditButtonAriaLabel={localizationKeys('identityPreviewEditButton__phoneNumber')}
      prepare={prepare}
    />
  </Flow.Part>
);

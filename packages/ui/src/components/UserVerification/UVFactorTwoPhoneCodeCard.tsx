import type { PhoneCodeFactor } from '@clerk/shared/types';

import { useUVFactorTwoPhoneCodeCardModel } from './uv-factor-two-phone-code-card.model';
import { UVFactorTwoPhoneCodeCardView } from './uv-factor-two-phone-code-card.view';
import type { UVFactorTwoCodeCard } from './UVFactorTwoCodeForm';

type UVFactorTwoPhoneCodeCardProps = UVFactorTwoCodeCard & { factor: PhoneCodeFactor };

export const UVFactorTwoPhoneCodeCard = (props: UVFactorTwoPhoneCodeCardProps) => {
  const model = useUVFactorTwoPhoneCodeCardModel(props.factor);
  return (
    <UVFactorTwoPhoneCodeCardView
      props={props}
      prepare={model.prepare}
    />
  );
};

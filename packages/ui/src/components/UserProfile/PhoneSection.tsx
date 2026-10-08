import { usePhoneSectionController } from './phone-section.controller';
import { type PhoneSectionProps, usePhoneSectionModel } from './phone-section.model';
import { PhoneSectionView } from './phone-section.view';

export const PhoneSection = (props: PhoneSectionProps) => {
  const model = usePhoneSectionModel();
  const controller = usePhoneSectionController(props, model);
  if (controller.status === 'hidden') {
    return null;
  }
  return <PhoneSectionView controller={controller} />;
};

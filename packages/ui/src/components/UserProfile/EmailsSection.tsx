import { useEmailsSectionController } from './emails-section.controller';
import { type EmailsSectionProps, useEmailsSectionModel } from './emails-section.model';
import { EmailsSectionView } from './emails-section.view';

export const EmailsSection = (props: EmailsSectionProps) => {
  const model = useEmailsSectionModel();
  const controller = useEmailsSectionController(props, model);
  return <EmailsSectionView controller={controller} />;
};

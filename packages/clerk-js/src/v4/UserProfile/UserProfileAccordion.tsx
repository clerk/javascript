import { useUserProfileContext } from '../../ui/contexts';
import { AccordionItem } from '../elements';
import { PropsOfComponent } from '../styledSystem';

export const UserProfileAccordion = (props: PropsOfComponent<typeof AccordionItem>) => {
  const isModal = useUserProfileContext().mode === 'modal';
  return (
    <AccordionItem
      scrollOnOpen={isModal}
      {...props}
    />
  );
};

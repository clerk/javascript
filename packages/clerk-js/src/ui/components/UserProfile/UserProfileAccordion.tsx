import { AccordionItem } from '../../elements';
import type { PropsOfComponent } from '../../styledSystem';

export const UserProfileAccordion = (props: PropsOfComponent<typeof AccordionItem>) => {
  return (
    <AccordionItem
      scrollOnOpen={true}
      {...props}
    />
  );
};

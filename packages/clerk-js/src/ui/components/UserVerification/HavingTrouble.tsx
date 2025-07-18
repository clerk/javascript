import { ErrorCard } from '@/ui/elements/ErrorCard';

import { localizationKeys } from '../../customizables';
import type { PropsOfComponent } from '../../styledSystem';

export const HavingTrouble = (props: PropsOfComponent<typeof ErrorCard>) => {
  const { onBackLinkClick } = props;

  return (
    <ErrorCard
      cardTitle={localizationKeys('reverification.alternativeMethods.getHelp.title')}
      cardSubtitle={localizationKeys('reverification.alternativeMethods.getHelp.content')}
      onBackLinkClick={onBackLinkClick}
    />
  );
};

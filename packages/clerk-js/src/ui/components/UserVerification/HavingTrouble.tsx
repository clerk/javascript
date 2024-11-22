import { localizationKeys } from '../../customizables';
import { ErrorCard } from '../../elements';
import type { PropsOfComponent } from '../../styledSystem';

export const HavingTrouble = (props: PropsOfComponent<typeof ErrorCard>) => {
  const { onBackLinkClick } = props;

  return (
    <ErrorCard
      cardTitle={localizationKeys('userVerification.alternativeMethods.getHelp.title')}
      cardSubtitle={localizationKeys('userVerification.alternativeMethods.getHelp.content')}
      onBackLinkClick={onBackLinkClick}
    />
  );
};

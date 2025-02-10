import { localizationKeys } from '../../customizables';
import { ErrorCard } from '../../elements';
import type { PropsOfComponent } from '../../styledSystem';

export const HavingTrouble = (props: PropsOfComponent<typeof ErrorCard>) => {
  const { onBackLinkClick } = props;

  return (
    <ErrorCard
      cardTitle={localizationKeys('signIn.alternativeMethods.getHelp.title')}
      cardSubtitle={localizationKeys('signIn.alternativeMethods.getHelp.content')}
      onBackLinkClick={onBackLinkClick}
    />
  );
};

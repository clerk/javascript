import { ProfileSection } from '@/ui/elements/Section';

import { localizationKeys, Text, useLocalizations } from '../../customizables';
import type { AccountCreditsViewProps } from './account-credits.types';

export function AccountCreditsView({ balance, localizationRoot, onViewHistory }: AccountCreditsViewProps) {
  const { $ } = useLocalizations();

  return (
    <ProfileSection.Root
      title={localizationKeys(`${localizationRoot}.billingPage.accountCreditsSection.title`)}
      centered={false}
      id='accountCredits'
      sx={t => ({
        borderTopWidth: t.borderWidths.$normal,
        borderTopStyle: t.borderStyles.$solid,
        borderTopColor: t.colors.$borderAlpha100,
      })}
    >
      <ProfileSection.ItemList
        id='accountCredits'
        disableAnimation
      >
        <ProfileSection.Item id='accountCredits'>
          <Text variant='subtitle'>{$(balance)}</Text>
        </ProfileSection.Item>
        <ProfileSection.Button
          id='accountCredits'
          localizationKey={localizationKeys(`${localizationRoot}.billingPage.accountCreditsSection.viewHistory`)}
          sx={[t => ({ justifyContent: 'start', height: t.sizes.$8 })]}
          onClick={onViewHistory}
        />
      </ProfileSection.ItemList>
    </ProfileSection.Root>
  );
}

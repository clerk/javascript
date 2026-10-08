import { Card } from '@/elements/Card';
import { localizationKeys } from '@/localization';

import type { useSharedFooterModel } from './shared-footer.model';

export const SharedFooterView = ({ identifier, signOut }: ReturnType<typeof useSharedFooterModel>) => (
  <Card.Action
    elementId='signOut'
    gap={4}
    justify='center'
    sx={() => ({ width: '100%' })}
  >
    {identifier && (
      <Card.ActionText
        truncate
        localizationKey={localizationKeys('taskSetupMfa.signOut.actionText', {
          identifier: identifier,
        })}
      />
    )}
    <Card.ActionLink
      sx={() => ({ flexShrink: 0 })}
      onClick={() => void signOut()}
      localizationKey={localizationKeys('taskSetupMfa.signOut.actionLink')}
    />
  </Card.Action>
);

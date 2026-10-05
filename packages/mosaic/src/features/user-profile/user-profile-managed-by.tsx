import * as stylex from '@stylexjs/stylex';

import { Icon } from '../../components/icon';
import type { ProviderLogoId } from '../../components/provider-logo';
import { ProviderLogo } from '../../components/provider-logo';
import { Section, sectionCompactStyles } from '../../components/section';
import { fill, useMessages } from '../../localization';

/** The enterprise connection a row's value comes from, which is why the row has nothing to edit. */
export interface UserProfileManagedBy {
  name?: string;
  provider?: ProviderLogoId;
}

export function UserProfileManagedByLabel({
  managedBy,
  template,
}: {
  managedBy: UserProfileManagedBy;
  template: string;
}) {
  const m = useMessages('userProfile');
  const name = managedBy.name || m.enterpriseConnection;
  return (
    <Section.Note
      icon={
        managedBy.provider ? (
          <ProviderLogo
            provider={managedBy.provider}
            size='sm'
          />
        ) : (
          <Icon
            aria-hidden
            name='lock'
            size='sm'
          />
        )
      }
    >
      <span {...stylex.props(sectionCompactStyles.hidden)}>{fill(template, { name })}</span>
      <span {...stylex.props(sectionCompactStyles.only)}>{name}</span>
    </Section.Note>
  );
}

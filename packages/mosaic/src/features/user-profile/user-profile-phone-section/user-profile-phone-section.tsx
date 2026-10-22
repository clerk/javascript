import { stringToFormattedPhoneString } from '@clerk/shared/phone';

import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import type { UserProfilePhone } from '../user-profile-contact.types';
import type { UserProfileContactAccess } from '../user-profile-contact.utils';
import { UserProfileContactListRowView } from '../user-profile-contact-list-row.view';
import { useUserProfilePhoneSectionController } from './user-profile-phone-section.controller';
import { useUserProfilePhoneSectionModel } from './user-profile-phone-section.model';
import type { ReadyPhoneSectionModel } from './user-profile-phone-section.types';
import { UserProfilePhoneSectionView } from './user-profile-phone-section.view';

export function UserProfilePhoneSection() {
  const model = useUserProfilePhoneSectionModel();

  if (model.status !== 'ready') {
    return null;
  }

  return <UserProfilePhoneSectionContent state={{ kind: 'interactive', model }} />;
}

export type PhoneSectionState =
  | { kind: 'snapshot'; phones: UserProfilePhone[]; eligibility: UserProfileContactAccess }
  | { kind: 'interactive'; model: ReadyPhoneSectionModel };

export function UserProfilePhoneSectionContent({ state }: { state: PhoneSectionState }) {
  if (state.kind === 'interactive') {
    return (
      <Phones
        key={state.model.userId}
        model={state.model}
      />
    );
  }
  return (
    <SnapshotPhones
      phones={state.phones}
      eligibility={state.eligibility}
    />
  );
}

function SnapshotPhones({ phones, eligibility }: Omit<Extract<PhoneSectionState, { kind: 'snapshot' }>, 'kind'>) {
  const m = useMessages('userProfileContact');
  return (
    <Section.Root>
      <UserProfileContactListRowView
        items={phones.map(phone => ({ ...phone, value: stringToFormattedPhoneString(phone.value) }))}
        kind='phone'
        label={m.phone.label}
        eligibility={eligibility}
        addAction={
          eligibility.canCreate ? (
            <Button
              aria-label={m.phone.add}
              color='neutral'
              size='sm'
              variant='outline'
              disabled
            >
              <Icon
                name='plus'
                placement='inline-start'
                size='sm'
              />
              {m.add}
            </Button>
          ) : undefined
        }
      />
    </Section.Root>
  );
}

function Phones({ model }: { model: ReadyPhoneSectionModel }) {
  const controller = useUserProfilePhoneSectionController(model);
  return <UserProfilePhoneSectionView {...controller} />;
}

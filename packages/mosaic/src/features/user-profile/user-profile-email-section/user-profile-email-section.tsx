import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import { UserProfileContactListRowView } from '../user-profile-contact-list-row.view';
import { useUserProfileEmailSectionController } from './user-profile-email-section.controller';
import { useUserProfileEmailSectionModel } from './user-profile-email-section.model';
import type { EmailSectionState, ReadyEmailSectionModel } from './user-profile-email-section.types';
import { UserProfileEmailSectionView } from './user-profile-email-section.view';

export function UserProfileEmailSection() {
  const model = useUserProfileEmailSectionModel();

  if (model.status !== 'ready') {
    return null;
  }

  return <UserProfileEmailSectionContent state={{ kind: 'interactive', model }} />;
}

export function UserProfileEmailSectionContent({ state }: { state: EmailSectionState }) {
  if (state.kind === 'snapshot') {
    return (
      <SnapshotEmails
        emails={state.emails}
        eligibility={state.eligibility}
      />
    );
  }
  return (
    <Emails
      key={state.model.userId}
      model={state.model}
    />
  );
}

function SnapshotEmails({ emails, eligibility }: Omit<Extract<EmailSectionState, { kind: 'snapshot' }>, 'kind'>) {
  const m = useMessages('userProfileContact');
  return (
    <Section.Root>
      <UserProfileContactListRowView
        items={emails}
        kind='email'
        label={m.email.label}
        eligibility={eligibility}
        addAction={
          eligibility.canCreate ? (
            <Button
              aria-label={m.email.add}
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

function Emails({ model }: { model: ReadyEmailSectionModel }) {
  const controller = useUserProfileEmailSectionController(model);
  return <UserProfileEmailSectionView {...controller} />;
}

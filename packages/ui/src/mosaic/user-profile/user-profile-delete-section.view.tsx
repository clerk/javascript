import { Button } from '../components/button';
import { Section } from '../components/section';
import { userProfileSecurityBase as m } from './user-profile-security.messages';

export interface UserProfileDeleteSectionViewProps {
  onDelete: () => void;
}

export function UserProfileDeleteSectionView({ onDelete }: UserProfileDeleteSectionViewProps) {
  return (
    <Section.Root>
      <Section.Title>{m.sections.dangerZone}</Section.Title>
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>{m.deleteAccount.title}</Section.Label>
              <Section.Description>{m.sections.deleteDescription}</Section.Description>
            </Section.Content>
            <Section.Actions>
              <Button
                color='negative'
                size='sm'
                variant='outline'
                onClick={onDelete}
              >
                {m.deleteAccount.title}
              </Button>
            </Section.Actions>
          </Section.Item>
        </Section.Row>
      </Section.Group>
    </Section.Root>
  );
}

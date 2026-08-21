import { Button } from '../components/button';
import { Section } from '../components/section';

export interface UserProfileDeleteSectionViewProps {
  onDelete: () => void;
}

export function UserProfileDeleteSectionView({ onDelete }: UserProfileDeleteSectionViewProps) {
  return (
    <Section.Root>
      <Section.Title>Danger zone</Section.Title>
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Delete account</Section.Label>
              <Section.Description>
                Permanently delete this account and all its data. This cannot be undone.
              </Section.Description>
            </Section.Content>
            <Section.Actions>
              <Button
                color='negative'
                size='sm'
                variant='outline'
                onClick={onDelete}
              >
                Delete account
              </Button>
            </Section.Actions>
          </Section.Item>
        </Section.Row>
      </Section.Group>
    </Section.Root>
  );
}

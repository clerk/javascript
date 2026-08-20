import { Button } from '../components/button';
import { Section } from '../components/section';

export interface UserProfilePasswordSectionViewProps {
  sectionTitle?: string;
  hasPassword?: boolean;
  onChangePassword?: () => void;
}

export function UserProfilePasswordSectionView({
  sectionTitle = 'Authentication',
  hasPassword = true,
  onChangePassword,
}: UserProfilePasswordSectionViewProps) {
  return (
    <Section.Root aria-label={sectionTitle ? undefined : 'Password'}>
      {sectionTitle ? <Section.Title>{sectionTitle}</Section.Title> : null}
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Password</Section.Label>
              {hasPassword ? <Section.Description>••••••••••••••••••</Section.Description> : null}
            </Section.Content>
            {onChangePassword ? (
              <Section.Actions>
                <Button
                  color='neutral'
                  size='sm'
                  variant='outline'
                  onClick={onChangePassword}
                >
                  {hasPassword ? 'Change password' : 'Set password'}
                </Button>
              </Section.Actions>
            ) : null}
          </Section.Item>
        </Section.Row>
      </Section.Group>
    </Section.Root>
  );
}

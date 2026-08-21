import { Button } from '../components/button';
import { Section } from '../components/section';
import { userProfileSecurityBase as m } from './user-profile-security.messages';

export interface UserProfilePasswordSectionViewProps {
  sectionTitle?: string;
  hasPassword?: boolean;
  onChangePassword?: () => void;
}

export function UserProfilePasswordSectionView({
  sectionTitle = m.sections.authentication,
  hasPassword = true,
  onChangePassword,
}: UserProfilePasswordSectionViewProps) {
  return (
    <Section.Root aria-label={sectionTitle ? undefined : m.sections.password}>
      {sectionTitle ? <Section.Title>{sectionTitle}</Section.Title> : null}
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>{m.sections.password}</Section.Label>
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
                  {hasPassword ? m.password.changeTitle : m.password.addTitle}
                </Button>
              </Section.Actions>
            ) : null}
          </Section.Item>
        </Section.Row>
      </Section.Group>
    </Section.Root>
  );
}

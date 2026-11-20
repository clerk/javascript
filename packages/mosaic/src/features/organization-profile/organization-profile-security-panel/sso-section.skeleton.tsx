import { ActionMenu } from '../../../components/action-menu';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { Skeleton } from '../../../components/skeleton';
import { VisuallyHidden } from '../../../components/visually-hidden';
import { InformationCircle } from '../../../icons/glyphs/information-circle';
import { useMessages } from '../../../localization';
import { UserProfileProviderMedia } from '../../user-profile/user-profile-provider-media';

export function SSOSectionSkeleton() {
  const m = useMessages('organizationProfile').security.sso;
  return (
    <Section.Root>
      <VisuallyHidden role='status'>{m.loading}</VisuallyHidden>
      <Section.Group>
        <Section.Header>
          <Section.Content>
            <Section.Title>{m.title}</Section.Title>
            <Section.Description>{m.description}</Section.Description>
          </Section.Content>
          <Section.Actions>
            <Button
              variant='ghost'
              color='neutral'
              shape='square'
              size='sm'
              disabled
            >
              <Icon glyph={InformationCircle} />
              <VisuallyHidden>{m.infoLabel}</VisuallyHidden>
            </Button>
          </Section.Actions>
        </Section.Header>
        <Section.Body>
          <Section.Row aria-hidden>
            <Section.Item>
              <Skeleton>
                <UserProfileProviderMedia provider='Okta' />
              </Skeleton>
              <Section.Content>
                <Section.Label>
                  <Skeleton>Northwind Workforce</Skeleton>
                </Section.Label>
                <Section.Description>
                  <Skeleton>northwind.co</Skeleton>
                </Section.Description>
              </Section.Content>
              <Section.Actions>
                <Skeleton shape='pill'>
                  <Badge>{m.status.active}</Badge>
                </Skeleton>
                <Skeleton visible={false}>
                  <ActionMenu
                    label={m.manage}
                    disabled
                    actions={[{ label: m.manage, onClick: () => undefined }]}
                  />
                </Skeleton>
              </Section.Actions>
            </Section.Item>
          </Section.Row>
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}

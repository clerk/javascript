import { Button } from '../components/button';
import { Section } from '../components/section';

export interface OrganizationProfileDangerSectionViewProps {
  onDeleteOrganization?: () => void;
  onLeaveOrganization?: () => void;
}

export function OrganizationProfileDangerSectionView({
  onDeleteOrganization,
  onLeaveOrganization,
}: OrganizationProfileDangerSectionViewProps) {
  if (!onDeleteOrganization && !onLeaveOrganization) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Title>Danger zone</Section.Title>
      <Section.Group>
        {onLeaveOrganization ? (
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Label>Leave organization</Section.Label>
                <Section.Description>
                  You will lose access to this organization and its applications.
                </Section.Description>
              </Section.Content>
              <Section.Actions>
                <Button
                  color='negative'
                  size='sm'
                  variant='outline'
                  onClick={onLeaveOrganization}
                >
                  Leave organization
                </Button>
              </Section.Actions>
            </Section.Item>
          </Section.Row>
        ) : null}
        {onDeleteOrganization ? (
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Label>Delete organization</Section.Label>
                <Section.Description>
                  Permanently delete this workspace and all its data. This cannot be undone. All members will lose
                  access.
                </Section.Description>
              </Section.Content>
              <Section.Actions>
                <Button
                  color='negative'
                  size='sm'
                  variant='outline'
                  onClick={onDeleteOrganization}
                >
                  Delete organization
                </Button>
              </Section.Actions>
            </Section.Item>
          </Section.Row>
        ) : null}
      </Section.Group>
    </Section.Root>
  );
}

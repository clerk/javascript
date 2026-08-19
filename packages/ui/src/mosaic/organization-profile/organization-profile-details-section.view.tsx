import * as stylex from '@stylexjs/stylex';

import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Section } from '../components/section';
import { styles } from './organization-profile-general-panel.styles';

export interface OrganizationProfileDetailsSectionViewProps {
  logoUrl?: string;
  name: string;
  slug: string;
  onCopySlug?: (slug: string) => void;
  onNameChange?: (name: string) => void;
  onUploadLogo?: () => void;
}

export function OrganizationProfileDetailsSectionView({
  logoUrl,
  name,
  slug,
  onCopySlug,
  onNameChange,
  onUploadLogo,
}: OrganizationProfileDetailsSectionViewProps) {
  return (
    <Section.Root>
      <Section.Title>Organization details</Section.Title>
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Media
              size='lg'
              {...stylex.props(styles.logo)}
            >
              {logoUrl ? (
                <img
                  alt={`${name} logo`}
                  src={logoUrl}
                  {...stylex.props(styles.logoImage)}
                />
              ) : (
                <Icon
                  aria-hidden
                  name='building'
                  size='md'
                />
              )}
            </Section.Media>
            <Section.Content>
              <Section.Label>Logo</Section.Label>
              <Section.Description>Recommended size 1:1, up to 10MB.</Section.Description>
            </Section.Content>
            {onUploadLogo ? (
              <Section.Actions>
                <Button
                  color='neutral'
                  size='sm'
                  variant='outline'
                  onClick={onUploadLogo}
                >
                  Upload
                </Button>
              </Section.Actions>
            ) : null}
          </Section.Item>
        </Section.Row>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Name</Section.Label>
              <Section.Description>{name}</Section.Description>
            </Section.Content>
            {onNameChange ? (
              <Section.Actions>
                <Button
                  color='neutral'
                  size='sm'
                  variant='outline'
                  onClick={() => onNameChange(name)}
                >
                  Edit name
                </Button>
              </Section.Actions>
            ) : null}
          </Section.Item>
        </Section.Row>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Slug</Section.Label>
              <Section.Description>{slug}</Section.Description>
            </Section.Content>
            {onCopySlug ? (
              <Section.Actions>
                <Button
                  color='neutral'
                  size='sm'
                  variant='outline'
                  onClick={() => onCopySlug(slug)}
                >
                  <Icon
                    name='copy'
                    placement='inline-start'
                    size='sm'
                  />
                  Copy
                </Button>
              </Section.Actions>
            ) : null}
          </Section.Item>
        </Section.Row>
      </Section.Group>
    </Section.Root>
  );
}

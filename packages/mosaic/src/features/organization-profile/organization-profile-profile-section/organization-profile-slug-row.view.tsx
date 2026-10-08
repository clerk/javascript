import * as stylex from '@stylexjs/stylex';

import { Button } from '../../../components/button';
import { CopyButton } from '../../../components/copy-button';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import { truncationStyles } from '../../../styles/typography.styles';
import { useOrganizationProfileEditSlugController } from './organization-profile-edit-slug.controller';
import { OrganizationProfileEditSlugDialog } from './organization-profile-edit-slug.dialog';
import { styles } from './organization-profile-profile-section.styles';

interface OrganizationProfileSlugRowViewProps {
  slug: string;
  onSubmit?: (slug: string) => Promise<void>;
}

export function OrganizationProfileSlugRowView({ slug, onSubmit }: OrganizationProfileSlugRowViewProps) {
  const m = useMessages('organizationProfileProfileSection');
  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{m.slug.label}</Section.Label>
          <Section.Description xstyle={styles.copyableValue}>
            <span
              {...stylex.props(truncationStyles.singleLine, styles.copyableText)}
              title={slug}
            >
              {slug}
            </span>
            <CopyButton
              value={slug}
              label={m.slug.copy}
              copiedLabel={m.slug.copied}
              xstyle={styles.copyAction}
            />
          </Section.Description>
        </Section.Content>
        {onSubmit ? (
          <Section.Actions>
            <EditSlug
              slug={slug}
              onSubmit={onSubmit}
            />
          </Section.Actions>
        ) : null}
      </Section.Item>
    </Section.Row>
  );
}

function EditSlug({ slug, onSubmit }: { slug: string; onSubmit: (slug: string) => Promise<void> }) {
  const m = useMessages('organizationProfileProfileSection');
  const controller = useOrganizationProfileEditSlugController({ slug, onSubmit });

  return (
    <OrganizationProfileEditSlugDialog
      form={controller.form}
      open={controller.isOpen}
      onOpenChange={controller.onOpenChange}
      trigger={
        <Button
          color='neutral'
          size='sm'
          variant='outline'
        >
          {m.slug.edit}
        </Button>
      }
    />
  );
}

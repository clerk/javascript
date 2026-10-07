import * as stylex from '@stylexjs/stylex';

import { Button } from '../../../components/button';
import { CopyButton } from '../../../components/copy-button';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import { truncationStyles } from '../../../styles/typography.styles';
import { OrganizationProfileEditFieldDialog } from './organization-profile-edit-field.dialog';
import { useOrganizationProfileEditSlugController } from './organization-profile-edit-slug.controller';
import { styles } from './organization-profile-profile-section.styles';

export interface OrganizationProfileSlugRowViewProps {
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
  const controller = useOrganizationProfileEditSlugController(slug, onSubmit);
  const { ref, ...field } = controller.form.register('slug');

  return (
    <OrganizationProfileEditFieldDialog
      open={controller.isOpen}
      onOpenChange={controller.onOpenChange}
      formId={controller.form.id}
      onSubmit={controller.form.handleSubmit}
      fieldRef={ref}
      {...field}
      feedback={controller.form.fields.slug.feedback}
      error={controller.form.error}
      canSave={controller.form.canSubmit}
      isSaving={controller.form.isSubmitting}
      title={m.slug.dialogTitle}
      description={m.slug.dialogDescription}
      fieldLabel={m.slug.fieldLabel}
      cancelLabel={m.slug.cancel}
      saveLabel={m.slug.save}
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

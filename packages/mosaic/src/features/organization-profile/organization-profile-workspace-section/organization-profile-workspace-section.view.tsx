import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import type { FileRejection } from '../../../primitives/file-upload';
import { OrganizationProfileLogoRowView } from './organization-profile-logo-row.view';
import { OrganizationProfileNameRowView } from './organization-profile-name-row.view';
import { OrganizationProfileSlugRowView } from './organization-profile-slug-row.view';

export interface OrganizationProfileWorkspaceSectionViewProps {
  name: string;
  slug: string;
  imageUrl?: string;
  hasImage?: boolean;
  onLogoChange?: (file: File) => void;
  onLogoReject?: (rejections: FileRejection[]) => void;
  onRemoveLogo?: () => void;
  onSubmitName?: (name: string) => Promise<void>;
  onSubmitSlug?: (slug: string) => Promise<void>;
}

export function OrganizationProfileWorkspaceSectionView({
  name,
  slug,
  imageUrl,
  hasImage = false,
  onLogoChange,
  onLogoReject,
  onRemoveLogo,
  onSubmitName,
  onSubmitSlug,
}: OrganizationProfileWorkspaceSectionViewProps) {
  const m = useMessages('organizationProfileWorkspaceSection');

  return (
    <Section.Root>
      <Section.Group>
        <Section.Title>{m.sectionTitle}</Section.Title>
        <Section.Surface>
          <OrganizationProfileLogoRowView
            name={name}
            imageUrl={imageUrl}
            hasImage={hasImage}
            onChange={onLogoChange}
            onReject={onLogoReject}
            onRemove={onRemoveLogo}
          />
          <OrganizationProfileNameRowView
            name={name}
            onSubmit={onSubmitName}
          />
          <OrganizationProfileSlugRowView
            slug={slug}
            onSubmit={onSubmitSlug}
          />
        </Section.Surface>
      </Section.Group>
    </Section.Root>
  );
}

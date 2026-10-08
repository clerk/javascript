import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import type { FileRejection } from '../../../primitives/file-upload';
import { OrganizationProfileLogoRowView } from './organization-profile-logo-row.view';
import { OrganizationProfileNameRowView } from './organization-profile-name-row.view';
import { OrganizationProfileSlugRowView } from './organization-profile-slug-row.view';

export interface OrganizationProfileProfileSectionViewProps {
  name: string;
  slug?: string;
  imageUrl?: string;
  hasImage?: boolean;
  onLogoChange?: (file: File) => Promise<void>;
  onLogoReject?: (rejections: FileRejection[]) => void;
  onRemoveLogo?: () => Promise<void>;
  onSubmitName?: (name: string) => Promise<void>;
  onSubmitSlug?: (slug: string) => Promise<void>;
}

export function OrganizationProfileProfileSectionView({
  name,
  slug,
  imageUrl,
  hasImage = false,
  onLogoChange,
  onLogoReject,
  onRemoveLogo,
  onSubmitName,
  onSubmitSlug,
}: OrganizationProfileProfileSectionViewProps) {
  const m = useMessages('organizationProfileProfileSection');

  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Content>
            <Section.Title>{m.sectionTitle}</Section.Title>
          </Section.Content>
        </Section.Header>
        <Section.Body>
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
          {slug !== undefined ? (
            <OrganizationProfileSlugRowView
              slug={slug}
              onSubmit={onSubmitSlug}
            />
          ) : null}
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}

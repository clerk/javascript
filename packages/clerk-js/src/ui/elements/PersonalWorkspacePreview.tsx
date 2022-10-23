import { localizationKeys } from '../localization';
import { UserPreview, UserPreviewProps } from './UserPreview';

export const PersonalWorkspacePreview = (props: Omit<UserPreviewProps, 'subtitle'>) => {
  return (
    <UserPreview
      rounded={false}
      subtitle={localizationKeys('organizationSwitcher.personalWorkspace')}
      {...props}
    />
  );
};

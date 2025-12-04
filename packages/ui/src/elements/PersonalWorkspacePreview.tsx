import type { UserPreviewProps } from './UserPreview';
import { UserPreview } from './UserPreview';

export const PersonalWorkspacePreview = (props: UserPreviewProps) => {
  return (
    <UserPreview
      elementId={'personalWorkspace'}
      rounded={false}
      {...props}
    />
  );
};

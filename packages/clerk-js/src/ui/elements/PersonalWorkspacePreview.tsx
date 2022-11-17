import { UserPreview, UserPreviewProps } from './UserPreview';

export const PersonalWorkspacePreview = (props: UserPreviewProps) => {
  return (
    <UserPreview
      rounded={false}
      elementId={'personalWorkspace'}
      {...props}
    />
  );
};

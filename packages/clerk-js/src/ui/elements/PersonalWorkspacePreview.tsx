import { UserPreview, UserPreviewProps } from './UserPreview';

export const PersonalWorkspacePreview = (props: UserPreviewProps) => {
  return (
    <UserPreview
      elementId={'personalWorkspace'}
      rounded={false}
      {...props}
    />
  );
};

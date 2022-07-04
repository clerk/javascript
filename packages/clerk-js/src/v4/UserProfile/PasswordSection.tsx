import { ProfileSection } from './Section';
import { AddBlockButton, BlockButton } from './UserProfileBlockButtons';

export const PasswordSection = () => {
  return (
    <ProfileSection
      title='Password'
      id='password'
    >
      <BlockButton>••••••••••</BlockButton>
      <AddBlockButton>Set password</AddBlockButton>
    </ProfileSection>
  );
};

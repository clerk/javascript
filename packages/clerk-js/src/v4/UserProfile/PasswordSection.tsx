import { useNavigate } from '../../ui/hooks/useNavigate';
import { ProfileSection } from './Section';
import { AddBlockButton, BlockButton } from './UserProfileBlockButtons';

export const PasswordSection = () => {
  const { navigate } = useNavigate();

  const navigateToPage = () => {
    return navigate('password');
  };

  return (
    <ProfileSection
      title='Password'
      id='password'
    >
      <BlockButton onClick={navigateToPage}>••••••••••</BlockButton>
      <AddBlockButton onClick={navigateToPage}>Set password</AddBlockButton>
    </ProfileSection>
  );
};

import { useCoreUser } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks/useNavigate';
import { Text } from '../customizables';
import { ProfileSection } from './Section';
import { AddBlockButton } from './UserProfileBlockButtons';

export const PasswordSection = () => {
  const { navigate } = useNavigate();
  const { passwordEnabled } = useCoreUser();

  const navigateToPage = () => {
    return navigate('password');
  };

  return (
    <ProfileSection
      title='Password'
      id='password'
    >
      {passwordEnabled && (
        <Text
          variant='smallRegular'
          sx={t => ({ padding: `${t.space.$2} ${t.space.$4}` })}
        >
          ••••••••••
        </Text>
      )}
      <AddBlockButton onClick={navigateToPage}>Set password</AddBlockButton>
    </ProfileSection>
  );
};

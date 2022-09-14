import { useCoreUser } from '../contexts';
import { localizationKeys, Text } from '../customizables';
import { useNavigate } from '../hooks/useNavigate';
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
      title={localizationKeys('userProfile.sectionTitle__password')}
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
      <AddBlockButton
        id='password'
        onClick={navigateToPage}
        textLocalizationKey={
          passwordEnabled
            ? localizationKeys('userProfile.sectionPrimaryButton__changePassword')
            : localizationKeys('userProfile.sectionPrimaryButton__setPassword')
        }
      />
    </ProfileSection>
  );
};

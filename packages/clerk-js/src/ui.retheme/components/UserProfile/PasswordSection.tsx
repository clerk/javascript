import { useCoreUser } from '../../contexts';
import { localizationKeys, Text } from '../../customizables';
import { ProfileSection } from '../../elements';
import { Pencil } from '../../icons';
import { useRouter } from '../../router';
import { AddBlockButton } from './UserProfileBlockButtons';

export const PasswordSection = () => {
  const { navigate } = useRouter();
  const { passwordEnabled } = useCoreUser();

  const navigateToPage = () => {
    return navigate('password');
  };

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.passwordSection.title')}
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
        leftIcon={passwordEnabled ? Pencil : undefined}
        textLocalizationKey={
          passwordEnabled
            ? localizationKeys('userProfile.start.passwordSection.primaryButton__changePassword')
            : localizationKeys('userProfile.start.passwordSection.primaryButton__setPassword')
        }
      />
    </ProfileSection>
  );
};

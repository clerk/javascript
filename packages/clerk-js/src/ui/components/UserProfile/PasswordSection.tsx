import { useCoreUser } from '../../contexts';
import { Flex, localizationKeys, Text } from '../../customizables';
import { ProfileSection } from '../../elements';
import { useNavigate } from '../../hooks/useNavigate';
import { AddBlockButton } from './UserProfileBlockButtons';

export const PasswordSection = () => {
  const { navigate } = useNavigate();
  const { passwordEnabled } = useCoreUser();

  const navigateToPasswordPage = () => navigate('password');
  // TODO: Uncomment these lines once the issue with enabled and required password is resolved
  // const navigateToPasswordRemovalPage = () => navigate('remove-password');

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
      <Flex
        direction={'row'}
        gap={4}
      >
        <AddBlockButton
          id='password'
          onClick={navigateToPasswordPage}
          textLocalizationKey={
            passwordEnabled
              ? localizationKeys('userProfile.start.passwordSection.primaryButton__changePassword')
              : localizationKeys('userProfile.start.passwordSection.primaryButton__setPassword')
          }
        />

        {/* TODO: Uncomment these lines once the issue with enabled and required password is resolved */}
        {/*{passwordEnabled && (*/}
        {/*  <AddBlockButton*/}
        {/*    id='password'*/}
        {/*    onClick={navigateToPasswordRemovalPage}*/}
        {/*    textLocalizationKey={localizationKeys('userProfile.start.passwordSection.primaryButton__removePassword')}*/}
        {/*  />*/}
        {/*)}*/}
      </Flex>
    </ProfileSection>
  );
};

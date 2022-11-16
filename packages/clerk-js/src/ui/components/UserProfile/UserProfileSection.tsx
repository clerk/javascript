import { useCoreUser } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { ProfileSection, UserPreview } from '../../elements';
import { useNavigate } from '../../hooks';
import { BlockButton } from './UserProfileBlockButtons';

export const UserProfileSection = () => {
  const { navigate } = useNavigate();
  const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = useCoreUser();

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.profileSection.title')}
      id='profile'
    >
      <BlockButton onClick={() => navigate('profile')}>
        <UserPreview
          user={userWithoutIdentifiers}
          size='lg'
        />
      </BlockButton>
    </ProfileSection>
  );
};

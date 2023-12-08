import { Button, Col, Flex, localizationKeys, Text } from '../../customizables';
import { ProfileSection } from '../../elements';
import { useRouter } from '../../router';

export const DeleteSection = () => {
  const { navigate } = useRouter();

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.dangerSection.title')}
      id='danger'
    >
      <Flex
        justify='between'
        sx={t => ({ marginTop: t.space.$2, marginLeft: t.space.$6 })}
      >
        <Col gap={1}>
          <Text
            variant='regularMedium'
            localizationKey={localizationKeys('userProfile.start.dangerSection.deleteAccountTitle')}
          />
          <Text
            variant='smallRegular'
            colorScheme='neutral'
            localizationKey={localizationKeys('userProfile.start.dangerSection.deleteAccountDescription')}
          />
        </Col>
        <Button
          aria-label='Delete account'
          variant='primaryDanger'
          textVariant='buttonExtraSmallBold'
          onClick={() => navigate(`delete`)}
          localizationKey={localizationKeys('userProfile.start.dangerSection.deleteAccountButton')}
        />
      </Flex>
    </ProfileSection>
  );
};

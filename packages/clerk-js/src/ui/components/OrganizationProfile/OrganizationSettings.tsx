import { AddBlockButton, BlockButton } from '../../common';
import { useCoreOrganization } from '../../contexts';
import { Badge, Box, Col, descriptors, Flex, Icon, localizationKeys, Spinner } from '../../customizables';
import {
  ArrowBlockButton,
  Header,
  IconButton,
  NavbarMenuButtonRow,
  OrganizationPreview,
  ProfileSection,
} from '../../elements';
import { useInView } from '../../hooks';
import { Times } from '../../icons';
import { useRouter } from '../../router';

export const OrganizationSettings = () => {
  return (
    <Col
      elementDescriptor={descriptors.page}
      gap={8}
    >
      <NavbarMenuButtonRow />
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('organizationSettings')}
        gap={8}
      >
        <Header.Root>
          <Header.Title
            localizationKey={localizationKeys('organizationProfile.start.headerTitle__settings')}
            textVariant='xxlargeMedium'
          />
          <Header.Subtitle localizationKey={localizationKeys('organizationProfile.start.headerSubtitle__settings')} />
        </Header.Root>
        <OrganizationProfileSection />
        <OrganizationDomainsSection />
        <OrganizationDangerSection />
      </Col>
    </Col>
  );
};

const OrganizationProfileSection = () => {
  const { organization, membership } = useCoreOrganization();
  const { navigate } = useRouter();
  const isAdmin = membership?.role === 'admin';

  if (!organization) {
    return null;
  }

  const profile = (
    <OrganizationPreview
      organization={organization}
      size='lg'
    />
  );

  return (
    <ProfileSection
      title={localizationKeys('organizationProfile.profilePage.title')}
      id='organizationProfile'
    >
      {isAdmin ? <BlockButton onClick={() => navigate('profile')}>{profile}</BlockButton> : profile}
    </ProfileSection>
  );
};

const OrganizationDomainsSection = () => {
  const { organization, membership, domains } = useCoreOrganization({
    domains: {
      infinite: true,
    },
  });

  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      if (inView) {
        void domains?.fetchNext?.();
      }
    },
  });

  const { navigate } = useRouter();
  const isAdmin = membership?.role === 'admin';

  if (!organization || !isAdmin) {
    return null;
  }

  return (
    <ProfileSection
      title={localizationKeys('organizationProfile.profilePage.domainSection.title')}
      id='organizationDomains'
    >
      <Col>
        {domains?.data?.map(d => (
          <ArrowBlockButton
            key={d.id}
            elementDescriptor={descriptors.accordionTriggerButton}
            variant='ghost'
            colorScheme='neutral'
            badge={
              d.verification && d.verification.status === 'verified' ? (
                <Badge textVariant={'extraSmallRegular'}>Verified</Badge>
              ) : (
                <Badge
                  textVariant={'extraSmallRegular'}
                  colorScheme={'warning'}
                >
                  Unverified
                </Badge>
              )
            }
            sx={t => ({
              padding: `${t.space.$3} ${t.space.$4}`,
              minHeight: t.sizes.$10,
            })}
            onClick={() => {
              d.verification && d.verification.status === 'verified'
                ? void navigate(`domain/${d.id}`)
                : void navigate(`domain/${d.id}/verify`);
            }}
          >
            {d.name}
          </ArrowBlockButton>
        ))}
        {(domains?.hasNextPage || domains?.isFetching) && (
          <Box
            ref={domains?.isFetching ? undefined : ref}
            sx={[
              t => ({
                width: '100%',
                height: t.space.$10,
                position: 'relative',
              }),
            ]}
          >
            <Box
              sx={{
                display: 'flex',
                margin: 'auto',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translateY(-50%) translateX(-50%)',
              }}
            >
              <Spinner
                size='md'
                colorScheme='primary'
              />
            </Box>
          </Box>
        )}
      </Col>

      <AddBlockButton
        textLocalizationKey={localizationKeys('organizationProfile.profilePage.domainSection.primaryButton')}
        id='addOrganizationDomain'
        onClick={() => navigate('domain')}
      />
    </ProfileSection>
  );
};

const OrganizationDangerSection = () => {
  const {
    organization,
    membership,
    membershipList: adminMembers,
  } = useCoreOrganization({
    membershipList: { role: ['admin'] },
  });
  const { navigate } = useRouter();

  if (!organization || !membership || !adminMembers) {
    return null;
  }

  const adminDeleteEnabled = organization.adminDeleteEnabled;
  const hasMoreThanOneAdmin = adminMembers.length > 1;
  const isAdmin = membership.role === 'admin';

  return (
    <ProfileSection
      id='organizationDanger'
      title={localizationKeys('organizationProfile.profilePage.dangerSection.title')}
      sx={t => ({ marginBottom: t.space.$4 })}
    >
      <Flex gap={4}>
        <IconButton
          aria-label='Leave organization'
          icon={
            <Icon
              icon={Times}
              size={'sm'}
              sx={t => ({ marginRight: t.space.$2 })}
            />
          }
          variant='outline'
          colorScheme='danger'
          textVariant='buttonExtraSmallBold'
          onClick={() => navigate('leave')}
          isDisabled={isAdmin && !hasMoreThanOneAdmin}
          localizationKey={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.title')}
        />
        {isAdmin && adminDeleteEnabled && (
          <IconButton
            aria-label='Delete organization'
            icon={
              <Icon
                icon={Times}
                size={'sm'}
                sx={t => ({ marginRight: t.space.$2 })}
              />
            }
            variant='outline'
            colorScheme='danger'
            textVariant='buttonExtraSmallBold'
            onClick={() => navigate('delete')}
            localizationKey={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.title')}
          />
        )}
      </Flex>
    </ProfileSection>
  );
};

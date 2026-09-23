import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { Button, Col, descriptors, Text } from '../../../customizables';
import { useRouter } from '../../../router';
import { policyTarget, protoKey, useAccessPrototype } from './prototypeState';

/*
 * Placeholder until the next commit: the tabbed Configure policy page
 * (Overview / SSO / Directory Sync) lands there. This exists so the table's
 * rows and menus already navigate somewhere real.
 */
export const ConfigurePolicyPage = ({ policyId }: { policyId: string }) => {
  const { policies } = useAccessPrototype();
  const { navigate } = useRouter();
  const policy = policies.find(entry => entry.id === policyId);

  return (
    <ProfileCard.Page>
      <Col
        elementDescriptor={descriptors.page}
        sx={t => ({ gap: t.space.$6 })}
      >
        <Button
          variant='link'
          sx={{ alignSelf: 'flex-start' }}
          localizationKey={protoKey('‹ Policies')}
          onClick={() => void navigate('../organization-access')}
        />
        <Header.Root>
          <Header.Title
            localizationKey={protoKey('Configure policy')}
            textVariant='h2'
          />
          <Header.Subtitle
            localizationKey={protoKey(policy ? policyTarget(policy, policies) : 'This policy no longer exists.')}
          />
        </Header.Root>
        <Text colorScheme='secondary'>Overview, SSO and Directory Sync tabs arrive in the next commit.</Text>
      </Col>
    </ProfileCard.Page>
  );
};

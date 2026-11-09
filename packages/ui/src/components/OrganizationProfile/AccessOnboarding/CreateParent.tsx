import { useState } from 'react';

import { Switch } from '@/ui/elements/Switch';

import { Badge, Button, Col, Flex, Text } from '../../../customizables';
import { DialogHeader, OverlayDialog } from './DomainClaim';
import { smallSx, TextInput, xsSx } from './parts';
import type { ProtoRelatedOrganization } from './prototypeState';
import { protoKey, simulateRequest, useAccessPrototype } from './prototypeState';

/* A parent can only be offered when the member can create one: not on a sub-organization or an existing parent. */
const useCanCreateParent = () => {
  const store = useAccessPrototype();
  return store.access.canManage && !store.hierarchy;
};

/*
 * Entry points for creating a parent, on the policy form where a shared
 * domain shows up: under a proven domain other organizations use, and when an
 * added domain is already owned by another organization.
 */
const CreateParentLink = ({ preselect }: { preselect: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        variant='link'
        colorScheme='primary'
        textVariant='buttonSmall'
        block={false}
        onClick={() => setIsOpen(true)}
        localizationKey={protoKey('Create parent organization')}
        sx={{ alignSelf: 'flex-start', padding: 0, minHeight: 0 }}
      />
      {isOpen ? (
        <CreateParentDialog
          preselect={preselect}
          onClose={() => setIsOpen(false)}
        />
      ) : null}
    </>
  );
};

/** Under a proven domain: other organizations use it too. */
export const SharedDomainPrompt = ({ domain }: { domain: string }) => {
  const store = useAccessPrototype();
  const canCreate = useCanCreateParent();
  const others = store.relatedOrganizations.filter(entry => entry.domain === domain);
  if (!canCreate || others.length === 0) {
    return null;
  }
  return (
    <Col sx={t => ({ gap: t.space.$0x5 })}>
      <Text
        colorScheme='secondary'
        sx={xsSx}
      >
        {`${listNames(others)} also ${others.length === 1 ? 'uses' : 'use'} ${domain}.`}
      </Text>
      <CreateParentLink preselect={others.filter(entry => entry.isAdmin).map(entry => entry.id)} />
    </Col>
  );
};

/** Adding a domain another organization already owns. */
export const DomainConflict = ({ organization }: { organization: ProtoRelatedOrganization }) => {
  const canCreate = useCanCreateParent();
  return (
    <Col sx={t => ({ gap: t.space.$0x5 })}>
      <Text
        colorScheme='danger'
        sx={xsSx}
      >
        {`${organization.name} already owns ${organization.domain}.`}
      </Text>
      {canCreate ? (
        <>
          <Text
            colorScheme='secondary'
            sx={xsSx}
          >
            {organization.isAdmin
              ? 'Put a parent over both to manage the domain from one place.'
              : `Put a parent over both. ${organization.name}’s owner has to agree first.`}
          </Text>
          <CreateParentLink preselect={[organization.id]} />
        </>
      ) : null}
    </Col>
  );
};

const listNames = (organizations: ProtoRelatedOrganization[]) =>
  organizations.length <= 2
    ? organizations.map(entry => entry.name).join(' and ')
    : `${organizations[0].name} and ${organizations.length - 1} others`;

const CreateParentDialog = ({ preselect, onClose }: { preselect: string[]; onClose: () => void }) => {
  const store = useAccessPrototype();
  const [name, setName] = useState(`${store.organizationName} Group`);
  const [chosen, setChosen] = useState<string[]>(preselect);
  const [isSaving, setIsSaving] = useState(false);

  const create = () => {
    setIsSaving(true);
    void simulateRequest().then(() => {
      store.createParent(name.trim() || `${store.organizationName} Group`, chosen);
      onClose();
    });
  };

  return (
    <OverlayDialog onClose={onClose}>
      <DialogHeader
        title='Create parent organization'
        description='A parent sits above your organizations. They keep their members, roles, and data. The parent manages sign-in, security, and billing for all of them.'
      />
      <Col sx={t => ({ gap: t.space.$1 })}>
        <Text
          variant='subtitle'
          sx={smallSx}
        >
          Name
        </Text>
        <TextInput
          ariaLabel='Parent organization name'
          value={name}
          onChange={setName}
        />
      </Col>
      <Col sx={t => ({ gap: t.space.$2 })}>
        <Text
          variant='subtitle'
          sx={smallSx}
        >
          Organizations
        </Text>
        <Flex
          align='center'
          gap={2}
        >
          <Switch
            isChecked
            isDisabled
            label={protoKey(store.organizationName)}
          />
          <Badge colorScheme='primary'>This organization</Badge>
        </Flex>
        {store.relatedOrganizations.map(organization => (
          <Flex
            key={organization.id}
            align='center'
            gap={2}
          >
            <Switch
              isChecked={chosen.includes(organization.id)}
              onChange={checked =>
                setChosen(checked ? [...chosen, organization.id] : chosen.filter(id => id !== organization.id))
              }
              label={protoKey(organization.name)}
            />
            <Text
              colorScheme='secondary'
              sx={xsSx}
            >
              {organization.isAdmin
                ? `${organization.domain}${organization.ownsDomain ? ' · proof moves up' : ''}`
                : `${organization.domain} · owner must agree`}
            </Text>
          </Flex>
        ))}
      </Col>
      <Text
        colorScheme='secondary'
        sx={xsSx}
      >
        You become the parent’s first member. Nobody joins it by domain; others join by invitation. Parent members
        aren’t added to the organizations under it.
      </Text>
      <Flex
        justify='end'
        gap={2}
      >
        <Button
          variant='outline'
          textVariant='buttonSmall'
          block={false}
          onClick={onClose}
          localizationKey={protoKey('Cancel')}
        />
        <Button
          textVariant='buttonSmall'
          block={false}
          isLoading={isSaving}
          onClick={create}
          localizationKey={protoKey('Create parent')}
        />
      </Flex>
    </OverlayDialog>
  );
};

import { useState } from 'react';

import { Button, Col, Flex, Text } from '../../../customizables';
import { Labelled, smallSx, TextInput } from './parts';
import { joinList, protoKey, provenDomains, simulateRequest, useAccessPrototype } from './prototypeState';

/** Names the account and creates it. */
export const EnterpriseSetupForm = ({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) => {
  const store = useAccessPrototype();
  const company = store.organizationName;
  const domains = provenDomains(store.policies);
  const [name, setName] = useState(`${company} Enterprise`);
  const [isSaving, setIsSaving] = useState(false);
  const enterprise = name.trim() || `${company} Enterprise`;

  const create = () => {
    setIsSaving(true);
    void simulateRequest().then(() => {
      store.createParent(
        enterprise,
        domains.length
          ? `${enterprise} is ready. Decide what happens to unmanaged users on the Members page.`
          : `${enterprise} is ready.`,
      );
      setIsSaving(false);
      onClose();
      onCreated();
    });
  };

  return (
    <Col sx={t => ({ gap: t.space.$4 })}>
      <Col sx={t => ({ gap: t.space.$1 })}>
        <Text variant='subtitle'>Set up a parent account</Text>
        <Text
          colorScheme='secondary'
          sx={smallSx}
        >
          {domains.length
            ? `${company} becomes its first organization. It manages everyone at ${joinList(domains)}.`
            : `${company} becomes its first organization.`}
        </Text>
      </Col>
      <Labelled label='Name'>
        <TextInput
          ariaLabel='Parent account name'
          value={name}
          onChange={setName}
          onEnter={create}
        />
      </Labelled>
      <Flex
        justify='end'
        gap={2}
      >
        <Button
          variant='ghost'
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
          localizationKey={protoKey('Create')}
        />
      </Flex>
    </Col>
  );
};

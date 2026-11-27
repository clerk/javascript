import { Col, Text } from '../../../customizables';
import { xsSx } from './parts';
import type { ProtoRelatedOrganization } from './prototypeState';

/** Adding a domain another organization already owns. */
export const DomainConflict = ({
  organization,
  only = 'add policies for it',
}: {
  organization: ProtoRelatedOrganization;
  /** What only the owner can do with the domain. */
  only?: string;
}) => (
  <Col sx={t => ({ gap: t.space.$0x5 })}>
    <Text
      colorScheme='danger'
      sx={xsSx}
    >
      {organization.sso
        ? `${organization.name} has single sign-on set up for ${organization.domain}.`
        : `${organization.name} already owns ${organization.domain}.`}
    </Text>
    <Text
      colorScheme='secondary'
      sx={xsSx}
    >
      {organization.sso
        ? `Only ${organization.name} can ${only}. Users there sign in with ${organization.name}’s SSO here too.`
        : `Only ${organization.name} can ${only}.`}
    </Text>
  </Col>
);

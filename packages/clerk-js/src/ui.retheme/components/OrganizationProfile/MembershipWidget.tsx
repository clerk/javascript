import { useOrganization } from '@clerk/shared/react';

import { runIfFunctionOrReturn } from '../../../utils';
import { useOrganizationProfileContext } from '../../contexts';
import { Col, Flex, Link, Text } from '../../customizables';
import { useRouter } from '../../router';

export const MembershipWidget = () => {
  const { organization } = useOrganization();
  //@ts-expect-error
  const { __unstable_manageBillingUrl, __unstable_manageBillingLabel, __unstable_manageBillingMembersLimit } =
    useOrganizationProfileContext();
  const router = useRouter();

  if (!organization) {
    return null;
  }

  const totalCount = organization?.membersCount + organization?.pendingInvitationsCount;

  return (
    <Flex
      sx={theme => ({
        background: theme.colors.$blackAlpha50,
        padding: theme.space.$4,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderRadius: theme.radii.$md,
      })}
    >
      <Col>
        <Text>Members can be given access to applications.</Text>

        {runIfFunctionOrReturn(__unstable_manageBillingMembersLimit) > 0 && (
          <Link
            sx={t => ({
              alignSelf: 'flex-start',
              color: t.colors.$primary500,
              marginTop: t.space.$1,
            })}
            onClick={() => router.navigate(runIfFunctionOrReturn(__unstable_manageBillingUrl))}
          >
            {runIfFunctionOrReturn(__unstable_manageBillingLabel) || 'Manage billing'}
          </Link>
        )}
      </Col>
      <Col>
        <Text
          sx={t => ({
            color: t.colors.$blackAlpha600,
          })}
        >
          {totalCount} of{' '}
          {__unstable_manageBillingMembersLimit
            ? `${runIfFunctionOrReturn(__unstable_manageBillingMembersLimit)} members`
            : 'unlimited'}
        </Text>
      </Col>
    </Flex>
  );
};

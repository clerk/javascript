import { useOrganization } from '@clerk/shared/react';
import { runIfFunctionOrReturn } from '@clerk/shared/utils';

import { Gauge } from '@/ui/elements/Gauge';

import { useOrganizationProfileContext } from '../../contexts';
import { Flex, Icon, Link, Text } from '../../customizables';
import { ArrowRightIcon } from '../../icons';
import { useRouter } from '../../router';
import { mqu } from '../../styledSystem';

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
  const limit = runIfFunctionOrReturn(__unstable_manageBillingMembersLimit);

  return (
    <Flex
      sx={theme => ({
        background: theme.colors.$neutralAlpha50,
        padding: theme.space.$2,
        borderRadius: theme.radii.$md,
        gap: theme.space.$4,
      })}
    >
      <Flex
        align='center'
        sx={t => ({
          [mqu.sm]: {
            gap: t.space.$3,
          },
          gap: t.space.$2,
        })}
      >
        {limit > 0 && (
          <Gauge
            limit={limit}
            value={totalCount}
            size='xs'
          />
        )}
        <Flex
          sx={t => ({
            [mqu.sm]: {
              flexDirection: 'column',
            },
            gap: t.space.$0x5,
          })}
        >
          <Text>You can invite {__unstable_manageBillingMembersLimit ? `up to ${limit}` : 'unlimited'} members.</Text>
          {limit > 0 && (
            <Link
              sx={t => ({
                fontWeight: t.fontWeights.$medium,
              })}
              variant='body'
              onClick={() => router.navigate(runIfFunctionOrReturn(__unstable_manageBillingUrl))}
            >
              {runIfFunctionOrReturn(__unstable_manageBillingLabel) || 'Manage billing'}

              <Icon icon={ArrowRightIcon} />
            </Link>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

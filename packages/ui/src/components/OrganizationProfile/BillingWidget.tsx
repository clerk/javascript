import { runIfFunctionOrReturn } from '@clerk/shared/utils';

import { AlertIcon, Flex, Link, Text } from '../../customizables';
import { useRouter } from '../../router';

export const BillingWidget = ({
  __unstable_manageBillingUrl,
  __unstable_manageBillingMembersLimit,
}: {
  __unstable_manageBillingUrl: string | ((args: any) => string);
  __unstable_manageBillingMembersLimit: string | ((args: any) => string);
}) => {
  const router = useRouter();

  return (
    <Flex
      sx={theme => ({
        background: theme.colors.$neutralAlpha50,
        padding: theme.space.$4,
        borderRadius: theme.radii.$md,
      })}
    >
      <AlertIcon
        variant='warning'
        colorScheme='danger'
        sx={t => ({ marginTop: t.space.$1 })}
      />
      <Text>
        This organization is limited to {runIfFunctionOrReturn(__unstable_manageBillingMembersLimit)} members.
        <br />
        <Link
          sx={t => ({
            alignSelf: 'flex-start',
            color: t.colors.$primary500,
            fontWeight: t.fontWeights.$normal,
          })}
          onClick={() => router.navigate(runIfFunctionOrReturn(__unstable_manageBillingUrl))}
        >
          Upgrade for unlimited members
        </Link>
      </Text>
    </Flex>
  );
};

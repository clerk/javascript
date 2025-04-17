import { Badge, Box, localizationKeys, Span, Table, Tbody, Td, Text, Th, Thead, Tr } from '../../customizables';
import { ThreeDotsMenu } from '../../elements';

export function BillingSubscriptionsList() {
  return (
    <Table tableHeadVisuallyHidden>
      <Thead>
        <Tr>
          <Th>Plan</Th>
          <Th>Start date</Th>
          <Th>Edit</Th>
        </Tr>
      </Thead>
      <Tbody>
        {[
          {
            name: 'Platinum',
            currentPlan: true,
            price: '$128.89',
            startDate: 'Jun 3',
          },
          {
            name: 'Bronze',
            price: '$18.89',
            startDate: 'Jun 3',
          },
        ].map(row => (
          <Tr key={row.name}>
            <Td>
              <Box
                sx={t => ({
                  display: 'flex',
                  columnGap: t.space.$2,
                })}
              >
                <Text variant='subtitle'>{row.name}</Text>
                <Badge
                  colorScheme={row.currentPlan ? 'secondary' : 'primary'}
                  localizationKey={
                    row.currentPlan
                      ? localizationKeys('badge__currentPlan')
                      : localizationKeys('badge__startsAt', { date: row.startDate })
                  }
                />
              </Box>
            </Td>
            <Td>
              <Text variant='subtitle'>
                {row.price}
                <Span
                  sx={t => ({
                    color: t.colors.$colorTextSecondary,
                    textTransform: 'lowercase',
                    ':before': {
                      content: '"/"',
                      marginInline: t.space.$1,
                    },
                  })}
                  localizationKey={localizationKeys('__experimental_commerce.month')}
                />
              </Text>
            </Td>
            <Td
              sx={_ => ({
                textAlign: 'right',
              })}
            >
              <ThreeDotsMenu
                actions={[
                  {
                    label: localizationKeys(
                      'userProfile.__experimental_billingPage.subscriptionsSection.actionLabel__default',
                    ),
                    onClick: () => {},
                  },
                  {
                    label: localizationKeys(
                      'userProfile.__experimental_billingPage.subscriptionsSection.actionLabel__cancel',
                    ),
                    onClick: () => {},
                    isDestructive: true,
                  },
                ]}
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

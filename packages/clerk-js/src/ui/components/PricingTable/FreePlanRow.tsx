import { useClerk } from '@clerk/shared/react';

import { usePlansContext, usePricingTableContext, useSubscriberTypeContext } from '../../contexts';
import { Button, Col, Flex, Icon, localizationKeys, Table, Tbody, Td, Text, Th, Thead, Tr } from '../../customizables';
import { Plans } from '../../icons';
import { InternalThemeProvider } from '../../styledSystem';
import { getClosestProfileScrollBox } from '../../utils';
export const FreePlanRow = () => {
  const clerk = useClerk();
  const { mode = 'mounted' } = usePricingTableContext();
  const subscriberType = useSubscriberTypeContext();

  const { isLoading, defaultFreePlan, isDefaultPlanImplicitlyActive } = usePlansContext();

  const handleSelect = (event?: React.MouseEvent<HTMLElement>) => {
    if (!defaultFreePlan) {
      return;
    }

    const portalRoot = getClosestProfileScrollBox(mode, event);

    clerk.__internal_openPlanDetails({
      plan: defaultFreePlan,
      subscriberType: subscriberType,
      portalRoot,
    });
  };

  if (isLoading || !defaultFreePlan || !isDefaultPlanImplicitlyActive || defaultFreePlan.features.length === 0) {
    return null;
  }

  return (
    <InternalThemeProvider>
      <Table
        tableHeadVisuallyHidden
        sx={t => ({
          marginBlockEnd: t.sizes.$4,
          'tr > td': {
            paddingInline: t.sizes.$4,
            paddingBlock: t.sizes.$2,
          },
          'tr > th': {
            paddingInline: t.sizes.$4,
            paddingBlock: t.sizes.$2,
          },
        })}
      >
        <Thead>
          <Tr>
            <Th>Plan</Th>
            <Th>Start date</Th>
            <Th>Edit</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>
              <Col gap={1}>
                <Flex
                  align='center'
                  gap={1}
                >
                  <Icon
                    icon={Plans}
                    sx={t => ({
                      width: t.sizes.$4,
                      height: t.sizes.$4,
                      opacity: t.opacity.$inactive,
                    })}
                  />
                  <Text
                    variant='subtitle'
                    sx={t => ({ marginRight: t.sizes.$1 })}
                  >
                    {defaultFreePlan.name}
                  </Text>
                </Flex>
                <Text
                  variant='caption'
                  colorScheme='secondary'
                  localizationKey={localizationKeys('__experimental_commerce.defaultFreePlanActive')}
                />
              </Col>
            </Td>
            <Td
              sx={_ => ({
                textAlign: 'right',
              })}
            >
              <Button
                onClick={event => handleSelect(event)}
                variant='bordered'
                colorScheme='secondary'
                localizationKey={localizationKeys('__experimental_commerce.viewFeatures')}
              />
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </InternalThemeProvider>
  );
};

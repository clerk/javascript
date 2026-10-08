import { Button, descriptors, Flex } from '../../customizables';
import type { SubscriptionDetailsActionsViewData } from './subscription-details.types';

export const SubscriptionDetailsActionsView = ({ controller }: { controller: SubscriptionDetailsActionsViewData }) => {
  if (controller.actions.length === 0) {
    return null;
  }

  return (
    <Flex
      elementDescriptor={descriptors.subscriptionDetailsCardActions}
      gap={2}
      sx={t => ({
        paddingInline: t.space.$3,
        paddingBlock: t.space.$3,
        borderBlockStartWidth: t.borderWidths.$normal,
        borderBlockStartStyle: t.borderStyles.$solid,
        borderBlockStartColor: t.colors.$borderAlpha100,
      })}
    >
      {controller.actions.map(action => (
        <Button
          key={action.key}
          elementDescriptor={
            action.isDestructive
              ? descriptors.subscriptionDetailsCancelButton
              : descriptors.subscriptionDetailsActionButton
          }
          variant={action.isDestructive ? 'ghost' : 'outline'}
          colorScheme={action.isDestructive ? 'danger' : undefined}
          size='xs'
          textVariant='buttonSmall'
          onClick={action.onClick}
          localizationKey={action.label}
        />
      ))}
    </Flex>
  );
};

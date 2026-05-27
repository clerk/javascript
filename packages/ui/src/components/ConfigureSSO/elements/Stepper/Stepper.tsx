import React from 'react';

import { Box, descriptors, Flex, Icon, SimpleButton, Text } from '@/customizables';
import { ChevronRight, Checkmark } from '@/icons';

import type { StepperItemProps, StepperProps } from './types';

const Root = ({ children }: StepperProps): JSX.Element => {
  const items = React.Children.toArray(children).filter(child => React.isValidElement(child));

  return (
    <Flex
      elementDescriptor={descriptors.configureSSOStepper}
      align='center'
      sx={theme => ({
        gap: theme.space.$2,
        flexWrap: 'wrap',
      })}
    >
      {items.map((child, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={index}>
          {child}
          {index < items.length - 1 && (
            <Icon
              elementDescriptor={descriptors.configureSSOStepperSeparator}
              icon={ChevronRight}
              size='md'
              colorScheme='neutral'
            />
          )}
        </React.Fragment>
      ))}
    </Flex>
  );
};

const Item = ({
  bullet,
  isCurrent,
  isCompleted,
  isReachable = true,
  onClick,
  children,
}: StepperItemProps): JSX.Element => {
  return (
    <SimpleButton
      elementDescriptor={descriptors.configureSSOStepperItem}
      isActive={isCurrent}
      variant='unstyled'
      isDisabled={!isReachable}
      onClick={onClick}
      sx={theme => ({
        gap: theme.space.$1x5,
        padding: 0,
        color: isCurrent || isCompleted ? theme.colors.$colorForeground : theme.colors.$colorMutedForeground,
        '&:disabled,&[data-disabled]': {
          opacity: 1,
        },
      })}
    >
      <Flex
        elementDescriptor={descriptors.configureSSOStepperItemBullet}
        isActive={isCurrent}
        align='center'
        justify='center'
        sx={theme => ({
          width: theme.sizes.$4,
          height: theme.sizes.$4,
          borderRadius: theme.radii.$circle,
          backgroundColor: isCurrent
            ? theme.colors.$colorForeground
            : isCompleted
              ? theme.colors.$success500
              : theme.colors.$colorMutedForeground,
        })}
      >
        {isCompleted && !isCurrent ? (
          <Icon
            icon={Checkmark}
            size='sm'
            sx={theme => ({ color: theme.colors.$white })}
          />
        ) : (
          <Text
            as='span'
            sx={theme => ({
              fontSize: theme.fontSizes.$xs,
              fontWeight: theme.fontWeights.$medium,
              color: theme.colors.$colorBackground,
            })}
          >
            {bullet}
          </Text>
        )}
      </Flex>

      <Text
        elementDescriptor={descriptors.configureSSOStepperItemLabel}
        as='span'
        variant='body'
        sx={{ fontWeight: 'inherit', color: 'inherit' }}
      >
        {children}
      </Text>
    </SimpleButton>
  );
};
Item.displayName = 'Stepper.Item';

type SkeletonProps = {
  totalSteps?: number;
};

const Skeleton = ({ totalSteps = 4 }: SkeletonProps): JSX.Element => (
  <Flex
    elementDescriptor={descriptors.configureSSOStepper}
    align='center'
    sx={theme => ({
      gap: theme.space.$2,
      flexWrap: 'wrap',
    })}
  >
    {Array.from({ length: totalSteps }).map((_, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <React.Fragment key={index}>
        <ItemSkeleton />
        {index < totalSteps - 1 && (
          <Icon
            elementDescriptor={descriptors.configureSSOStepperSeparator}
            icon={ChevronRight}
            size='md'
            colorScheme='neutral'
            sx={{ opacity: 0.16 }}
          />
        )}
      </React.Fragment>
    ))}
  </Flex>
);

const ItemSkeleton = (): JSX.Element => (
  <Flex
    align='center'
    sx={t => ({ gap: t.space.$1x5, minHeight: t.sizes.$4x5, opacity: 0.16 })}
  >
    <Box
      sx={t => ({
        width: t.sizes.$4,
        height: t.sizes.$4,
        borderRadius: t.radii.$circle,
        backgroundColor: t.colors.$colorMutedForeground,
      })}
    />
    <Box
      sx={t => ({
        width: t.sizes.$17,
        height: t.sizes.$1x5,
        borderRadius: t.radii.$md,
        backgroundColor: t.colors.$colorMutedForeground,
      })}
    />
  </Flex>
);

/**
 * Numbered step indicator — purely presentational.
 *
 * Each `<Stepper.Item>` is a self-rendering component that takes
 * `label`, `bullet`, `isCurrent`, `isCompleted`, `isReachable`, and
 * `onClick`. The Stepper container only handles layout (gap +
 * inserts a chevron separator between items). It does NOT walk
 * children to extract descriptors, NOT compute reachability, NOT
 * track current state — all of that is the host's responsibility.
 *
 * For the wizard surface, see `ConfigureSSOHeader` which maps
 * `useWizard()` state into Stepper.Item props.
 */
export const Stepper = Object.assign(Root, {
  Item,
  Skeleton,
});

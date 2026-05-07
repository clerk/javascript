import React from 'react';

import { Button, descriptors, Flex, Icon, Text, useLocalizations } from '@/customizables';
import { CaretRight, Check } from '@/icons';

import type { BreadcrumbsActiveItem, BreadcrumbsItemProps, BreadcrumbsProps } from './types';

const Item = (_: BreadcrumbsItemProps): JSX.Element | null => null;
Item.displayName = 'Breadcrumbs.Item';

/**
 * Walks the breadcrumbs' children and returns the descriptors for
 * every `<Breadcrumbs.Item>` element
 */
function extractItems(children: React.ReactNode): BreadcrumbsActiveItem[] {
  const items: BreadcrumbsActiveItem[] = [];

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) {
      return;
    }

    // Tolerate fragments at the top level (e.g. when callers map over
    // an array of steps and wrap items in a fragment)
    if (child.type === React.Fragment) {
      const fragmentChildren = (child.props as { children?: React.ReactNode }).children;
      items.push(...extractItems(fragmentChildren));
      return;
    }

    if (child.type !== Item) {
      return;
    }

    const props = child.props as BreadcrumbsItemProps;
    items.push({
      id: props.id,
      label: props.label,
      isCompleted: props.isCompleted,
    });
  });

  return items;
}

const Root = ({ currentId, onItemClick, children }: BreadcrumbsProps): JSX.Element => {
  const { t } = useLocalizations();

  const items = React.useMemo(() => extractItems(children), [children]);
  const currentIndex = React.useMemo(() => items.findIndex(i => i.id === currentId), [items, currentId]);

  return (
    <Flex
      // TODO: add descriptor
      // elementDescriptor={}
      align='center'
      sx={theme => ({
        gap: theme.space.$2,
        flexWrap: 'wrap',
      })}
    >
      {items.map((item, index) => {
        const isCurrent = index === currentIndex;
        const isCompleted = item.isCompleted ?? index < currentIndex;
        const isReachable = isCompleted || index <= currentIndex;
        const labelText = item.label ? (typeof item.label === 'string' ? item.label : t(item.label)) : '';

        return (
          <React.Fragment key={item.id}>
            <Button
              // TODO: add descriptor
              elementDescriptor={descriptors.configureSSOWizardHeaderItem}
              elementId={descriptors.configureSSOWizardHeaderItem.setId(item.id)}
              isActive={isCurrent}
              variant='unstyled'
              isDisabled={!isReachable}
              onClick={() => {
                if (isReachable) {
                  onItemClick(item.id);
                }
              }}
              sx={theme => ({
                gap: theme.space.$1x5,
                padding: 0,
                color: isCurrent || isCompleted ? theme.colors.$colorForeground : theme.colors.$colorMutedForeground,
              })}
            >
              <Flex
                elementDescriptor={descriptors.configureSSOWizardHeaderItemBullet}
                elementId={descriptors.configureSSOWizardHeaderItemBullet.setId(item.id)}
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
                      : theme.colors.$neutralAlpha400,
                })}
              >
                {isCompleted && !isCurrent ? (
                  <Icon
                    icon={Check}
                    sx={theme => ({ width: theme.sizes.$2, height: theme.sizes.$2, color: theme.colors.$white })}
                  />
                ) : (
                  <Text
                    as='span'
                    sx={theme => ({
                      fontSize: theme.fontSizes.$xs,
                      fontWeight: theme.fontWeights.$semibold,
                      color: theme.colors.$colorBackground,
                    })}
                  >
                    {index + 1}
                  </Text>
                )}
              </Flex>

              <Text
                elementDescriptor={descriptors.configureSSOWizardHeaderItemLabel}
                elementId={descriptors.configureSSOWizardHeaderItemLabel.setId(item.id)}
                as='span'
                variant='body'
                sx={{ fontWeight: 'inherit', color: 'inherit' }}
              >
                {labelText}
              </Text>
            </Button>
            {index < items.length - 1 && (
              <Icon
                elementDescriptor={descriptors.configureSSOWizardHeaderSeparator}
                icon={CaretRight}
                size='md'
                sx={theme => ({ color: theme.colors.$colorMutedForeground })}
              />
            )}
          </React.Fragment>
        );
      })}
    </Flex>
  );
};

/**
 * Numbered breadcrumb of wizard steps.
 *
 * Items are written as JSX children: render a `<Breadcrumbs.Item>`
 * for each step. Reachability is computed internally from `currentId`
 * + the items list — items at indices `<= currentIndex` are clickable
 * (calls `onItemClick(id)`), later items are disabled. Items marked
 * `isCompleted` render the check icon and are reachable regardless of
 * position
 *
 * Presentational primitive — no awareness of the wizard or its
 * context
 */
export const Breadcrumbs = Object.assign(Root, {
  Item,
});

import React from 'react';

import { Button, descriptors, Flex, Icon, Text, useLocalizations } from '@/customizables';
import { CaretRight, Check } from '@/icons';

import type { BreadcrumbsProps } from './types';

/**
 * Numbered breadcrumb of wizard steps.
 *
 * Presentational primitive — no awareness of the wizard or its
 * context. Items at indices `<= currentIndex` are clickable (calls
 * `onItemClick(id)`); later items are disabled. Items marked
 * `isCompleted` render the check icon and are reachable regardless of
 * position
 */
export const Breadcrumbs = ({ items, currentIndex, onItemClick }: BreadcrumbsProps): JSX.Element => {
  const { t } = useLocalizations();

  return (
    <Flex
      elementDescriptor={descriptors.configureSSOWizardHeader}
      align='center'
      sx={theme => ({
        gap: theme.space.$2,
        padding: `${theme.space.$4} ${theme.space.$6}`,
        borderBottomWidth: theme.borderWidths.$normal,
        borderBottomStyle: theme.borderStyles.$solid,
        borderBottomColor: theme.colors.$borderAlpha100,
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
                color: isCurrent ? theme.colors.$colorForeground : theme.colors.$colorMutedForeground,
              })}
            >
              <Flex
                elementDescriptor={descriptors.configureSSOWizardHeaderItemBullet}
                elementId={descriptors.configureSSOWizardHeaderItemBullet.setId(item.id)}
                isActive={isCurrent}
                align='center'
                justify='center'
                sx={theme => ({
                  width: theme.sizes.$5,
                  height: theme.sizes.$5,
                  borderRadius: theme.radii.$circle,
                  fontSize: theme.fontSizes.$xs,
                  fontWeight: theme.fontWeights.$semibold,
                  backgroundColor: isCurrent
                    ? theme.colors.$colorForeground
                    : isCompleted
                      ? theme.colors.$success500
                      : theme.colors.$neutralAlpha100,
                  color: isCurrent
                    ? theme.colors.$colorBackground
                    : isCompleted
                      ? theme.colors.$white
                      : theme.colors.$colorMutedForeground,
                })}
              >
                {isCompleted && !isCurrent ? (
                  <Icon
                    icon={Check}
                    size='xs'
                  />
                ) : (
                  index + 1
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
                size='sm'
                sx={theme => ({ color: theme.colors.$colorMutedForeground })}
              />
            )}
          </React.Fragment>
        );
      })}
    </Flex>
  );
};

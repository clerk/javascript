import * as React from 'react';

import { Box, Dd, descriptors, Dl, Dt, Span } from '../customizables';
import { common } from '../styledSystem';

/* -------------------------------------------------------------------------------------------------
 * LineItems.Root
 * -----------------------------------------------------------------------------------------------*/

interface RootProps {
  children: React.ReactNode;
}

function Root({ children }: RootProps) {
  return (
    <Dl
      elementDescriptor={descriptors.lineItemsRoot}
      sx={t => ({
        display: 'grid',
        gridRowGap: t.space.$2,
      })}
    >
      {children}
    </Dl>
  );
}

/* -------------------------------------------------------------------------------------------------
 * LineItems.Group
 * -----------------------------------------------------------------------------------------------*/

type GroupVariant = 'primary' | 'secondary' | 'tertiary';

interface GroupContextValue {
  variant: GroupVariant;
}

const GroupContext = React.createContext<GroupContextValue | undefined>(undefined);

interface GroupProps {
  children: React.ReactNode;
  /**
   * @default `false`
   */
  borderTop?: boolean;
  variant?: GroupVariant;
}

function Group({ children, borderTop = false, variant = 'primary' }: GroupProps) {
  return (
    <GroupContext.Provider value={{ variant }}>
      <Box
        elementDescriptor={descriptors.lineItemsGroup}
        elementId={descriptors.lineItemsGroup.setId(variant)}
        sx={t => ({
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          ...(borderTop
            ? {
                borderTopWidth: t.borderWidths.$normal,
                borderTopStyle: t.borderStyles.$solid,
                borderTopColor: t.colors.$neutralAlpha100,
                paddingTop: t.space.$2,
              }
            : {}),
        })}
      >
        {children}
      </Box>
    </GroupContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * LineItems.Title
 * -----------------------------------------------------------------------------------------------*/

interface TitleProps {
  children: React.ReactNode;
  description?: React.ReactNode;
}

function Title({ children, description }: TitleProps) {
  const context = React.useContext(GroupContext);
  if (!context) {
    throw new Error('LineItems.Title must be used within LineItems.Group');
  }
  const { variant } = context;
  const textVariant = variant === 'primary' ? 'subtitle' : 'caption';
  return (
    <Dt
      elementDescriptor={descriptors.lineItemsTitle}
      elementId={descriptors.lineItemsTitle.setId(variant)}
      sx={t => ({
        display: 'grid',
        color: variant === 'primary' ? t.colors.$colorText : t.colors.$colorTextSecondary,
        marginTop: variant !== 'primary' ? t.space.$0x25 : undefined,
        ...common.textVariants(t)[textVariant],
      })}
    >
      {children}
      {description ? (
        <Span
          elementDescriptor={descriptors.lineItemsTitleDescription}
          sx={t => ({
            fontSize: t.fontSizes.$sm,
            color: t.colors.$colorTextSecondary,
          })}
        >
          {description}
        </Span>
      ) : null}
    </Dt>
  );
}

/* -------------------------------------------------------------------------------------------------
 * LineItems.Description
 * -----------------------------------------------------------------------------------------------*/

interface DescriptionProps {
  children: React.ReactNode;
  /**
   * Render a piece of text before the description text.
   */
  prefix?: React.ReactNode;
  /**
   * Render a note below the description text.
   */
  suffix?: React.ReactNode;
}

function Description({ children, prefix, suffix }: DescriptionProps) {
  const context = React.useContext(GroupContext);
  if (!context) {
    throw new Error('LineItems.Description must be used within LineItems.Group');
  }
  const { variant } = context;
  return (
    <Dd
      elementDescriptor={descriptors.lineItemsDescription}
      elementId={descriptors.lineItemsDescription.setId(variant)}
      sx={t => ({
        display: 'grid',
        justifyContent: 'end',
        color: variant === 'tertiary' ? t.colors.$colorTextSecondary : t.colors.$colorText,
      })}
    >
      <Span
        elementDescriptor={descriptors.lineItemsDescriptionInner}
        sx={t => ({
          display: 'inline-flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: t.space.$1,
        })}
      >
        {prefix ? (
          <Span
            elementDescriptor={descriptors.lineItemsDescriptionPrefix}
            sx={t => ({
              color: t.colors.$colorTextSecondary,
              ...common.textVariants(t).caption,
            })}
          >
            {prefix}
          </Span>
        ) : null}
        <Span
          elementDescriptor={descriptors.lineItemsDescriptionText}
          sx={t => ({
            ...common.textVariants(t).body,
          })}
        >
          {children}
        </Span>
      </Span>
      {suffix ? (
        <Span
          elementDescriptor={descriptors.lineItemsDescriptionSuffix}
          sx={t => ({
            color: t.colors.$colorTextSecondary,
            ...common.textVariants(t).caption,
          })}
        >
          {suffix}
        </Span>
      ) : null}
    </Dd>
  );
}

export const LineItems = {
  Root,
  Group,
  Title,
  Description,
};

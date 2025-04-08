import * as React from 'react';

import type { LocalizationKey } from '../customizables';
import { Box, Button, Dd, descriptors, Dl, Dt, Icon, Span } from '../customizables';
import { useClipboard } from '../hooks';
import { Check, Copy } from '../icons';
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
  title: string | LocalizationKey;
  description?: string | LocalizationKey;
}

function Title({ title, description }: TitleProps) {
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
      <Span localizationKey={title} />
      {description ? (
        <Span
          localizationKey={description}
          elementDescriptor={descriptors.lineItemsTitleDescription}
          sx={t => ({
            fontSize: t.fontSizes.$sm,
            color: t.colors.$colorTextSecondary,
          })}
        />
      ) : null}
    </Dt>
  );
}

/* -------------------------------------------------------------------------------------------------
 * LineItems.Description
 * -----------------------------------------------------------------------------------------------*/

interface DescriptionProps {
  text: string | LocalizationKey;
  truncateText?: boolean;
  copyText?: boolean;
  prefix?: string | LocalizationKey;
  suffix?: string | LocalizationKey;
}

function Description({ text, prefix, suffix, truncateText = false, copyText = false }: DescriptionProps) {
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
          minWidth: '0',
        })}
      >
        {prefix ? (
          <Span
            localizationKey={prefix}
            elementDescriptor={descriptors.lineItemsDescriptionPrefix}
            sx={t => ({
              color: t.colors.$colorTextSecondary,
              ...common.textVariants(t).caption,
            })}
          />
        ) : null}
        {typeof text === 'string' && truncateText ? (
          <Span
            elementDescriptor={descriptors.lineItemsDescriptionText}
            sx={t => ({
              ...common.textVariants(t).body,
              display: 'flex',
              minWidth: '0',
            })}
          >
            <Span
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {text.slice(0, -5)}
            </Span>
            <Span>{text.slice(-5)}</Span>
          </Span>
        ) : (
          <Span
            localizationKey={text}
            elementDescriptor={descriptors.lineItemsDescriptionText}
            sx={t => ({
              ...common.textVariants(t).body,
              minWidth: '0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            })}
          />
        )}
        {typeof text === 'string' && copyText ? <CopyButton text={text} /> : null}
      </Span>
      {suffix ? (
        <Span
          localizationKey={suffix}
          elementDescriptor={descriptors.lineItemsDescriptionSuffix}
          sx={t => ({
            color: t.colors.$colorTextSecondary,
            ...common.textVariants(t).caption,
          })}
        />
      ) : null}
    </Dd>
  );
}

function CopyButton({ text }: { text: string }) {
  const { onCopy, hasCopied } = useClipboard(text || '');

  return (
    <Button
      variant='unstyled'
      onClick={onCopy}
      sx={t => ({
        color: 'inherit',
        width: t.sizes.$4,
        height: t.sizes.$4,
        padding: 0,
      })}
      focusRing={false}
    >
      <Icon
        size='sm'
        icon={hasCopied ? Check : Copy}
      />
    </Button>
  );
}

export const LineItems = {
  Root,
  Group,
  Title,
  Description,
};

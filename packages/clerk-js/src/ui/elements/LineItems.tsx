import * as React from 'react';

import type { LocalizationKey } from '../customizables';
import { Box, Button, Dd, descriptors, Dl, Dt, Icon, Span } from '../customizables';
import { useClipboard } from '../hooks';
import { Check, Copy } from '../icons';
import { common } from '../styledSystem';
import { truncateWithEndVisible } from '../utils/truncateTextWithEndVisible';

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
  expand?: boolean;
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
                borderTopColor: t.colors.$borderAlpha100,
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
  title?: string | LocalizationKey;
  description?: string | LocalizationKey;
  icon?: React.ComponentType;
  badge?: React.ReactNode;
}

const Title = React.forwardRef<HTMLTableCellElement, TitleProps>(({ title, description, icon, badge = null }, ref) => {
  const context = React.useContext(GroupContext);
  if (!context) {
    throw new Error('LineItems.Title must be used within LineItems.Group');
  }
  const { variant } = context;
  const textVariant = variant === 'primary' ? 'subtitle' : 'caption';
  return (
    <Dt
      ref={ref}
      elementDescriptor={descriptors.lineItemsTitle}
      elementId={descriptors.lineItemsTitle.setId(variant)}
      sx={t => ({
        display: 'grid',
        color: variant === 'primary' ? t.colors.$colorForeground : t.colors.$colorMutedForeground,
        ...common.textVariants(t)[textVariant],
      })}
    >
      {title ? (
        <Span
          sx={t => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: t.space.$1,
          })}
        >
          {icon ? (
            <Icon
              size='md'
              icon={icon}
              aria-hidden
            />
          ) : null}
          <Span localizationKey={title} />
          {badge}
        </Span>
      ) : null}
      {description ? (
        <Span
          localizationKey={description}
          elementDescriptor={descriptors.lineItemsTitleDescription}
          sx={t => ({
            fontSize: t.fontSizes.$sm,
            color: t.colors.$colorMutedForeground,
          })}
        />
      ) : null}
    </Dt>
  );
});

/* -------------------------------------------------------------------------------------------------
 * LineItems.Description
 * -----------------------------------------------------------------------------------------------*/

interface DescriptionProps {
  text: string | LocalizationKey;
  /**
   * When true, the text will be truncated with an ellipsis in the middle and the last 5 characters will be visible.
   * @default `false`
   */
  truncateText?: boolean;
  /**
   * When true, there will be a button to copy the providedtext.
   * @default `false`
   */
  copyText?: boolean;
  /**
   * The visually hidden label for the copy button.
   * @default `Copy`
   */
  copyLabel?: string;
  prefix?: string | LocalizationKey;
  suffix?: string | LocalizationKey;
}

function Description({ text, prefix, suffix, truncateText = false, copyText = false, copyLabel }: DescriptionProps) {
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
        color: variant === 'tertiary' ? t.colors.$colorMutedForeground : t.colors.$colorForeground,
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
              color: t.colors.$colorMutedForeground,
              ...common.textVariants(t).caption,
            })}
          />
        ) : null}
        {typeof text === 'string' && truncateText ? (
          <TruncatedText text={text} />
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
        {typeof text === 'string' && copyText ? (
          <CopyButton
            text={text}
            copyLabel={copyLabel}
          />
        ) : null}
      </Span>
      {suffix ? (
        <Span
          localizationKey={suffix}
          elementDescriptor={descriptors.lineItemsDescriptionSuffix}
          sx={t => ({
            color: t.colors.$colorMutedForeground,
            ...common.textVariants(t).caption,
            justifySelf: 'flex-end',
          })}
        />
      ) : null}
    </Dd>
  );
}

function TruncatedText({ text }: { text: string }) {
  const { onCopy } = useClipboard(text);
  return (
    <Span
      elementDescriptor={descriptors.lineItemsDescriptionText}
      sx={t => ({
        ...common.textVariants(t).body,
        display: 'flex',
        minWidth: '0',
      })}
      onCopy={async e => {
        e.preventDefault();
        await onCopy();
      }}
    >
      {truncateWithEndVisible(text, 15)}
    </Span>
  );
}

function CopyButton({ text, copyLabel = 'Copy' }: { text: string; copyLabel?: string }) {
  const { onCopy, hasCopied } = useClipboard(text);

  return (
    <Button
      variant='unstyled'
      onClick={onCopy}
      sx={t => ({
        color: 'inherit',
        width: t.sizes.$4,
        height: t.sizes.$4,
        padding: 0,
        borderRadius: t.radii.$sm,
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: t.colors.$colorRing,
        },
      })}
      focusRing={false}
      aria-label={hasCopied ? 'Copied' : copyLabel}
    >
      <Icon
        size='sm'
        icon={hasCopied ? Check : Copy}
        aria-hidden
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

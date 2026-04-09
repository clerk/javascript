import React from 'react';

import type { LocalizationKey } from '../../customizables';
import { Badge, Box, Button, descriptors, Heading, Icon, Span, Text } from '../../customizables';
import { useClipboard } from '../../hooks';
import { Check, Copy, Plans } from '../../icons';
import { truncateWithEndVisible } from '../../utils/truncateTextWithEndVisible';

/* -------------------------------------------------------------------------------------------------
 * Statement.Root
 * -----------------------------------------------------------------------------------------------*/

function Root({ children }: { children: React.ReactNode }) {
  return (
    <Box
      elementDescriptor={descriptors.statementRoot}
      as='article'
      sx={t => ({
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$borderAlpha100,
        borderRadius: t.radii.$lg,
        overflow: 'clip',
      })}
    >
      {children}
    </Box>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Statement.Header
 * -----------------------------------------------------------------------------------------------*/

function Header({ title, id, status }: { title: string | LocalizationKey; id: string; status: string }) {
  return (
    <Box
      elementDescriptor={descriptors.statementHeader}
      as='header'
      sx={t => ({
        padding: t.space.$4,
        background: t.colors.$neutralAlpha25,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      })}
    >
      <Span elementDescriptor={descriptors.statementHeaderTitleContainer}>
        <Heading
          elementDescriptor={descriptors.statementHeaderTitle}
          textVariant='h2'
          localizationKey={title}
        />
        <Span
          sx={t => ({
            display: 'flex',
            alignItems: 'center',
            gap: t.space.$0x25,
            color: t.colors.$colorMutedForeground,
          })}
        >
          <CopyButton
            copyLabel='Copy statement ID'
            text={id}
          />
          <Text
            colorScheme='secondary'
            variant='subtitle'
          >
            {truncateWithEndVisible(id)}
          </Text>
        </Span>
      </Span>
      <Badge
        elementDescriptor={descriptors.statementHeaderBadge}
        colorScheme={status === 'open' ? 'secondary' : 'primary'}
        sx={{ textTransform: 'capitalize' }}
      >
        {status}
      </Badge>
    </Box>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Statement.Body
 * -----------------------------------------------------------------------------------------------*/

function Body({ children }: { children: React.ReactNode }) {
  return <Box elementDescriptor={descriptors.statementBody}>{children}</Box>;
}
/* -------------------------------------------------------------------------------------------------
 * Statement.Section
 * -----------------------------------------------------------------------------------------------*/

function Section({ children }: { children: React.ReactNode }) {
  return (
    <Box
      elementDescriptor={descriptors.statementSection}
      as='section'
    >
      {children}
    </Box>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Statement.SectionHeader
 * -----------------------------------------------------------------------------------------------*/

function SectionHeader({ text }: { text: string | LocalizationKey }) {
  return (
    <Box
      elementDescriptor={descriptors.statementSectionHeader}
      sx={t => ({
        paddingInline: t.space.$4,
        paddingBlock: t.space.$1,
        background: t.colors.$neutralAlpha50,
        borderBlockWidth: t.borderWidths.$normal,
        borderBlockStyle: t.borderStyles.$solid,
        borderBlockColor: t.colors.$borderAlpha100,
      })}
    >
      <Heading
        elementDescriptor={descriptors.statementSectionHeaderTitle}
        textVariant='h3'
        as='h2'
        localizationKey={text}
        sx={t => ({
          fontWeight: t.fontWeights.$medium,
        })}
      />
    </Box>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Statement.SectionContent
 * -----------------------------------------------------------------------------------------------*/

function SectionContent({ children }: { children: React.ReactNode }) {
  return <Box elementDescriptor={descriptors.statementSectionContent}>{children}</Box>;
}

/* -------------------------------------------------------------------------------------------------
 * Statement.SectionContentItem
 * -----------------------------------------------------------------------------------------------*/

function SectionContentItem({ children }: { children: React.ReactNode }) {
  return (
    <Box
      elementDescriptor={descriptors.statementSectionContentItem}
      sx={t => ({
        paddingInline: t.space.$4,
        paddingBlock: t.space.$3,
        '&:not(:first-child)': {
          borderBlockStartWidth: t.borderWidths.$normal,
          borderBlockStartStyle: t.borderStyles.$solid,
          borderBlockStartColor: t.colors.$borderAlpha100,
        },
      })}
    >
      {children}
    </Box>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Statement.SectionContentDetailsHeader
 * -----------------------------------------------------------------------------------------------*/

function SectionContentDetailsHeader({
  title,
  description,
  secondaryTitle,
  secondaryDescription,
}: {
  title: string | LocalizationKey;
  description: string | LocalizationKey;
  secondaryTitle?: string | LocalizationKey;
  secondaryDescription?: string | LocalizationKey;
}) {
  return (
    <Box
      elementDescriptor={descriptors.statementSectionContentDetailsHeader}
      sx={t => ({
        marginBlockEnd: t.space.$2,
        display: 'flex',
        justifyContent: 'space-between',
      })}
    >
      <Box elementDescriptor={descriptors.statementSectionContentDetailsHeaderItem}>
        <Span
          sx={t => ({
            display: 'flex',
            alignItems: 'center',
            gap: t.space.$1,
          })}
        >
          <Icon
            elementDescriptor={descriptors.statementSectionContentDetailsHeaderItemIcon}
            icon={Plans}
            colorScheme='neutral'
          />
          <Heading
            elementDescriptor={descriptors.statementSectionContentDetailsHeaderTitle}
            as='h3'
            textVariant='h3'
            localizationKey={title}
          />
        </Span>
        <Text
          variant='caption'
          colorScheme='secondary'
          elementDescriptor={descriptors.statementSectionContentDetailsHeaderDescription}
          localizationKey={description}
          sx={{ textTransform: 'lowercase' }}
        />
      </Box>
      <Box
        elementDescriptor={descriptors.statementSectionContentDetailsHeaderItem}
        sx={{
          textAlign: 'end',
        }}
      >
        {secondaryTitle && (
          <Text
            variant='h3'
            elementDescriptor={descriptors.statementSectionContentDetailsHeaderSecondaryTitle}
            localizationKey={secondaryTitle}
          />
        )}
        {secondaryDescription && (
          <Text
            variant='caption'
            colorScheme='secondary'
            elementDescriptor={descriptors.statementSectionContentDetailsHeaderSecondaryDescription}
            localizationKey={secondaryDescription}
          />
        )}
      </Box>
    </Box>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Statement.SectionContentDetailsList
 * -----------------------------------------------------------------------------------------------*/

function SectionContentDetailsList({ children }: { children: React.ReactNode }) {
  return (
    <Box
      elementDescriptor={descriptors.statementSectionContentDetailsList}
      as='ul'
      sx={t => ({
        margin: 0,
        padding: 0,
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$borderAlpha100,
        borderRadius: t.radii.$md,
        overflow: 'hidden',
      })}
    >
      {children}
    </Box>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Statement.SectionContentDetailsListItem
 * -----------------------------------------------------------------------------------------------*/

function SectionContentDetailsListItem({
  labelIcon,
  label,
  valueCopyable = false,
  value,
  valueTruncated = false,
}: {
  icon?: React.ReactNode;
  label: string | LocalizationKey;
  labelIcon?: React.ComponentType;
  value: string | LocalizationKey | React.ReactElement;
  valueTruncated?: boolean;
  valueCopyable?: boolean;
}) {
  return (
    <Box
      elementDescriptor={descriptors.statementSectionContentDetailsListItem}
      as='li'
      sx={t => ({
        margin: 0,
        paddingInline: t.space.$2,
        paddingBlock: t.space.$1x5,
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        columnGap: t.space.$2,
        rowGap: t.space.$0x5,
        '&:not(:first-child)': {
          borderBlockStartWidth: t.borderWidths.$normal,
          borderBlockStartStyle: t.borderStyles.$solid,
          borderBlockStartColor: t.colors.$borderAlpha100,
        },
      })}
    >
      <Span
        elementDescriptor={descriptors.statementSectionContentDetailsListItemLabelContainer}
        sx={t => ({
          display: 'flex',
          alignItems: 'center',
          gap: t.space.$1x5,
        })}
      >
        {labelIcon ? (
          <Icon
            icon={labelIcon}
            colorScheme='neutral'
          />
        ) : null}
        <Text
          variant='caption'
          colorScheme='secondary'
          elementDescriptor={descriptors.statementSectionContentDetailsListItemLabel}
          localizationKey={label}
        />
      </Span>
      <Span
        sx={t => ({
          display: 'flex',
          alignItems: 'center',
          gap: t.space.$0x25,
          color: t.colors.$colorMutedForeground,
        })}
      >
        {typeof value === 'string' ? (
          <>
            {valueCopyable ? (
              <CopyButton
                copyLabel='Copy statement ID'
                text={value}
              />
            ) : null}
            <Text
              colorScheme='secondary'
              variant='caption'
              elementDescriptor={descriptors.statementSectionContentDetailsListItemValue}
            >
              {valueTruncated ? truncateWithEndVisible(value) : value}
            </Text>
          </>
        ) : React.isValidElement(value) ? (
          value
        ) : (
          <Text
            elementDescriptor={descriptors.statementSectionContentDetailsListItemValue}
            colorScheme='secondary'
            variant='caption'
            localizationKey={value as LocalizationKey}
          />
        )}
      </Span>
    </Box>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Statement.Footer
 * -----------------------------------------------------------------------------------------------*/

function Footer({ label, value }: { label: string | LocalizationKey; value: string }) {
  return (
    <Box
      elementDescriptor={descriptors.statementFooter}
      as='footer'
      sx={t => ({
        paddingInline: t.space.$4,
        paddingBlock: t.space.$3,
        background: t.colors.$neutralAlpha25,
        borderBlockStartWidth: t.borderWidths.$normal,
        borderBlockStartStyle: t.borderStyles.$solid,
        borderBlockStartColor: t.colors.$borderAlpha100,
        display: 'flex',
        justifyContent: 'space-between',
      })}
    >
      <Text
        variant='h3'
        localizationKey={label}
        elementDescriptor={descriptors.statementFooterLabel}
      />
      <Span
        elementDescriptor={descriptors.statementFooterValueContainer}
        sx={t => ({
          display: 'flex',
          alignItems: 'center',
          gap: t.space.$2x5,
        })}
      >
        <Text
          variant='caption'
          colorScheme='secondary'
          elementDescriptor={descriptors.statementFooterCurrency}
        >
          USD
        </Text>
        <Text
          variant='h3'
          elementDescriptor={descriptors.statementFooterValue}
        >
          {value}
        </Text>
      </Span>
    </Box>
  );
}

function CopyButton({ text, copyLabel = 'Copy' }: { text: string; copyLabel?: string }) {
  const { onCopy, hasCopied } = useClipboard(text);

  return (
    <Button
      elementDescriptor={descriptors.statementCopyButton}
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

export const Statement = {
  Root,
  Header,
  Body,
  Section,
  SectionHeader,
  SectionContent,
  SectionContentItem,
  SectionContentDetailsHeader,
  SectionContentDetailsList,
  SectionContentDetailsListItem,
  Footer,
};

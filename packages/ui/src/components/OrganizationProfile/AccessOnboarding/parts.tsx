import { createContext, useId } from 'react';

import { Tooltip } from '@/ui/elements/Tooltip';

import { Box, Button, Col, Flex, Icon, Input, RadioInput, Text } from '../../../customizables';
import { ArrowLeft, ChevronLeft, ChevronRight, Close, ExclamationTriangle, InformationCircle } from '../../../icons';
import { protoKey } from './prototypeState';

/* Layout pieces shared by the Access pages, drawn to the Oct 2026 "MVP" Figma. */

/** The profile's content pane, so dialogs blur it rather than the whole screen. */
export const ContentRefContext = createContext<React.RefObject<HTMLDivElement> | null>(null);

export const smallSx = (t: { fontSizes: { $sm: string } }) => ({ fontSize: t.fontSizes.$sm });
export const xsSx = (t: { fontSizes: { $xs: string } }) => ({ fontSize: t.fontSizes.$xs });

export const borderSx = (t: {
  borderWidths: { $normal: string };
  borderStyles: { $solid: string };
  colors: { $borderAlpha100: string };
  radii: { $lg: string };
}) => ({
  borderWidth: t.borderWidths.$normal,
  borderStyle: t.borderStyles.$solid,
  borderColor: t.colors.$borderAlpha100,
  borderRadius: t.radii.$lg,
});

export const InfoTooltip = ({ text }: { text: string }) => (
  <Tooltip.Root>
    <Tooltip.Trigger>
      <Button
        variant='unstyled'
        aria-label={text}
        onClick={event => event.stopPropagation()}
        sx={t => ({
          display: 'inline-flex',
          alignItems: 'center',
          padding: 0,
          height: 'fit-content',
          borderRadius: t.radii.$sm,
          color: t.colors.$colorMutedForeground,
        })}
      >
        <Icon
          icon={InformationCircle}
          aria-hidden
          sx={t => ({ width: t.sizes.$3x5, height: t.sizes.$3x5 })}
        />
      </Button>
    </Tooltip.Trigger>
    <Tooltip.Content text={protoKey(text)} />
  </Tooltip.Root>
);

export const WarningLine = ({ children }: { children: string }) => (
  <Flex
    align='center'
    gap={1}
    sx={t => ({ color: t.colors.$colorMutedForeground })}
  >
    <Icon
      icon={ExclamationTriangle}
      sx={t => ({ width: t.sizes.$4, height: t.sizes.$4 })}
    />
    <Text
      colorScheme='secondary'
      sx={smallSx}
    >
      {children}
    </Text>
  </Flex>
);

/** The policy form's two-column row: label on the left, control on the right. */
export const SettingRow = ({ label, info, children }: { label: string; info?: string; children: React.ReactNode }) => (
  <Flex
    gap={6}
    sx={t => ({
      alignItems: 'flex-start',
      paddingBlock: t.space.$6,
      borderBottomWidth: t.borderWidths.$normal,
      borderBottomStyle: t.borderStyles.$solid,
      borderBottomColor: t.colors.$borderAlpha100,
      '&:last-of-type': { borderBottomWidth: 0 },
    })}
  >
    <Flex
      align='center'
      gap={1}
      sx={t => ({ width: '35%', flexShrink: 0, minHeight: t.sizes.$8 })}
    >
      <Text variant='subtitle'>{label}</Text>
      {info ? <InfoTooltip text={info} /> : null}
    </Flex>
    <Col sx={t => ({ gap: t.space.$3, flex: 1, minWidth: 0, justifyContent: 'center' })}>{children}</Col>
  </Flex>
);

/** A radio with a title and a muted line under it; `children` render nested under the option. */
export const RadioOption = ({
  name,
  checked,
  onSelect,
  label,
  description,
  badge,
  isDisabled,
  children,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  label: string;
  description?: string;
  badge?: React.ReactNode;
  isDisabled?: boolean;
  children?: React.ReactNode;
}) => {
  const id = useId();
  return (
    <Col sx={t => ({ gap: t.space.$2 })}>
      <Flex
        align='start'
        gap={2}
      >
        <RadioInput
          id={id}
          name={name}
          checked={checked}
          isDisabled={isDisabled}
          onChange={onSelect}
          focusRing={false}
          sx={t => ({ width: 'fit-content', marginTop: t.space.$0x5, flexShrink: 0 })}
        />
        <label
          htmlFor={id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.125rem',
            cursor: isDisabled ? 'default' : 'pointer',
          }}
        >
          <Flex
            align='center'
            gap={2}
          >
            <Text variant='subtitle'>{label}</Text>
            {badge}
          </Flex>
          {description ? (
            <Text
              colorScheme='secondary'
              sx={smallSx}
            >
              {description}
            </Text>
          ) : null}
        </label>
      </Flex>
      {checked && children ? <Box sx={t => ({ paddingInlineStart: t.space.$6 })}>{children}</Box> : null}
    </Col>
  );
};

/** "← Add policy": the form pages' title row. */
export const BackTitle = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <Flex
    align='center'
    gap={2}
    sx={t => ({
      paddingBottom: t.space.$4,
      borderBottomWidth: t.borderWidths.$normal,
      borderBottomStyle: t.borderStyles.$solid,
      borderBottomColor: t.colors.$borderAlpha100,
    })}
  >
    <Button
      variant='ghost'
      aria-label='Back'
      onClick={onBack}
      sx={t => ({ padding: t.space.$1, minHeight: 'auto', height: 'auto' })}
    >
      <Icon
        icon={ArrowLeft}
        sx={t => ({ width: t.sizes.$4, height: t.sizes.$4, color: t.colors.$colorMutedForeground })}
      />
    </Button>
    <Text variant='h2'>{title}</Text>
  </Flex>
);

/** "‹ Policy … ×" over a large title: the setup and manage pages. */
export const SubPageHeader = ({
  backLabel,
  title,
  description,
  onBack,
}: {
  backLabel: string;
  title: string;
  description?: string;
  onBack: () => void;
}) => (
  <Col
    sx={t => ({
      gap: t.space.$5,
      paddingBottom: t.space.$5,
      borderBottomWidth: t.borderWidths.$normal,
      borderBottomStyle: t.borderStyles.$solid,
      borderBottomColor: t.colors.$borderAlpha100,
    })}
  >
    <Flex
      justify='between'
      align='center'
    >
      <Button
        variant='ghost'
        textVariant='buttonSmall'
        block={false}
        onClick={onBack}
        sx={t => ({ paddingInline: t.space.$1, color: t.colors.$colorMutedForeground })}
      >
        <Icon
          icon={ChevronLeft}
          sx={t => ({ width: t.sizes.$3x5, height: t.sizes.$3x5, marginInlineEnd: t.space.$1 })}
        />
        {backLabel}
      </Button>
      <Button
        variant='ghost'
        aria-label='Close'
        onClick={onBack}
        sx={t => ({ padding: t.space.$1, color: t.colors.$colorMutedForeground })}
      >
        <Icon
          icon={Close}
          sx={t => ({ width: t.sizes.$3, height: t.sizes.$3 })}
        />
      </Button>
    </Flex>
    <Col sx={t => ({ gap: t.space.$1 })}>
      <Text variant='h2'>{title}</Text>
      {description ? (
        <Text
          colorScheme='secondary'
          sx={smallSx}
        >
          {description}
        </Text>
      ) : null}
    </Col>
  </Col>
);

/** The grey bar pinned to the bottom of the form and setup pages. */
export const PageFooter = ({ start, children }: { start?: React.ReactNode; children: React.ReactNode }) => (
  <Flex
    justify='between'
    align='center'
    gap={2}
    sx={t => ({
      position: 'sticky',
      bottom: `calc(${t.space.$7} * -1)`,
      marginTop: 'auto',
      marginInline: `calc(${t.space.$8} * -1) calc(${t.space.$6} * -1)`,
      marginBottom: `calc(${t.space.$7} * -1)`,
      padding: `${t.space.$3} ${t.space.$4}`,
      backgroundColor: t.colors.$neutralAlpha25,
      backdropFilter: 'blur(8px)',
      borderTopWidth: t.borderWidths.$normal,
      borderTopStyle: t.borderStyles.$solid,
      borderTopColor: t.colors.$borderAlpha100,
      zIndex: 1,
    })}
  >
    <Box>{start}</Box>
    <Flex
      align='center'
      gap={2}
    >
      {children}
    </Flex>
  </Flex>
);

/** "Step 1 of 3" with a dash per step. */
export const StepCounter = ({ step, total }: { step: number; total: number }) => (
  <Flex
    align='center'
    gap={4}
  >
    <Text
      colorScheme='secondary'
      sx={xsSx}
    >
      Step{' '}
      <Text
        as='span'
        sx={xsSx}
      >
        {`${step} of ${total}`}
      </Text>
    </Text>
    <Flex gap={1}>
      {Array.from({ length: total }, (_, index) => (
        <Box
          key={index}
          sx={t => ({
            width: t.sizes.$6,
            height: '3px',
            borderRadius: t.radii.$sm,
            backgroundColor: index < step ? t.colors.$colorForeground : t.colors.$borderAlpha150,
          })}
        />
      ))}
    </Flex>
  </Flex>
);

export const ContinueButton = ({
  label = 'Continue',
  onClick,
  isDisabled,
  isLoading,
}: {
  label?: string;
  onClick: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}) => (
  <Button
    textVariant='buttonSmall'
    block={false}
    isDisabled={isDisabled}
    isLoading={isLoading}
    onClick={onClick}
  >
    {label}
    <Icon
      icon={ChevronRight}
      sx={t => ({ width: t.sizes.$3x5, height: t.sizes.$3x5, marginInlineStart: t.space.$1 })}
    />
  </Button>
);

export const Labelled = ({
  label,
  children,
  end,
}: {
  label: string;
  children: React.ReactNode;
  end?: React.ReactNode;
}) => (
  <Col sx={t => ({ gap: t.space.$2 })}>
    <Flex
      justify='between'
      align='center'
    >
      <Text variant='subtitle'>{label}</Text>
      {end}
    </Flex>
    {children}
  </Col>
);

/** A plain controlled text input outside the Form machinery. */
export const TextInput = ({
  value,
  onChange,
  placeholder,
  onEnter,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onEnter?: () => void;
  ariaLabel?: string;
}) => (
  <Input
    value={value}
    aria-label={ariaLabel}
    placeholder={placeholder}
    onChange={event => onChange(event.target.value)}
    onKeyDown={event => {
      if (event.key === 'Enter' && onEnter) {
        event.preventDefault();
        onEnter();
      }
    }}
  />
);

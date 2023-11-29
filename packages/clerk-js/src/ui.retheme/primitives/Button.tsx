import type { PropsWithChildren } from 'react';
import React from 'react';

import { descriptors, Icon, Spinner } from '../customizables';
import { ArrowRightButtonIcon } from '../icons';
import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { common, createCssVariables, createVariants } from '../styledSystem';
import { colors } from '../utils';
import { applyDataStateProps } from './applyDataStateProps';
import { Flex } from './Flex';

const vars = createCssVariables('accent', 'accentDark', 'accentDarker', 'accentLighter', 'accentLightest', 'border');

const { applyVariants, filterProps } = createVariants((theme, props: OwnProps) => {
  return {
    base: {
      margin: 0,
      padding: 0,
      border: 0,
      outline: 0,
      userSelect: 'none',
      cursor: 'pointer',
      backgroundColor: 'unset',
      color: 'currentColor',
      borderRadius: theme.radii.$md,
      position: 'relative',
      isolation: 'isolate',
      ...common.centeredFlex('inline-flex'),
      ...common.disabled(theme),
      transitionProperty: theme.transitionProperty.$common,
      transitionDuration: theme.transitionDuration.$controls,
    },
    variants: {
      textVariant: common.textVariants(theme),
      size: {
        iconLg: { minHeight: theme.sizes.$14, width: theme.sizes.$14 },
        xs: { minHeight: theme.sizes.$1x5, padding: `${theme.space.$1x5} ${theme.space.$1x5}` },
        sm: {
          minHeight: theme.sizes.$7,
          padding: `${theme.space.$1x5} ${theme.space.$3x5}`,
        },
        md: {
          minHeight: theme.sizes.$9,
          padding: `${theme.space.$2x5} ${theme.space.$5}`,
          letterSpacing: theme.sizes.$xxs,
        },
      },
      colorScheme: {
        primary: {
          [vars.accentLightest]: colors.setAlpha(theme.colors.$primary400, 0.3), // TODO: once we have the new color palette
          [vars.accentLighter]: colors.setAlpha(theme.colors.$primary800, 0.3), // WIP reference: Updated to new color palette; previously `$primary500`
          [vars.accent]: theme.colors.$primary800, // WIP reference: Updated to new color palette; previously `$primary500`
          [vars.accentDark]: theme.colors.$primary600, // TODO: once we have the new color palette
          [vars.accentDarker]: theme.colors.$primary700, // TODO: once we have the new color palette
        },
        danger: {
          [vars.accentLightest]: colors.setAlpha(theme.colors.$danger400, 0.3),
          [vars.accentLighter]: colors.setAlpha(theme.colors.$danger500, 0.3),
          [vars.accent]: theme.colors.$danger500,
          [vars.accentDark]: theme.colors.$danger600,
          [vars.accentDarker]: theme.colors.$danger700,
        },
        neutral: {
          [vars.border]: theme.colors.$blackAlpha200,
          [vars.accentLightest]: theme.colors.$blackAlpha50, // TODO: once we have the new color palette and style for pseudo classes
          [vars.accentLighter]: theme.colors.$blackAlpha300, // TODO: once we have the new color palette and style for pseudo classes
          [vars.accent]: theme.colors.$blackAlpha800, // WIP reference: Updated to new color palette; previously `$colorText`
          [vars.accentDark]: theme.colors.$blackAlpha600, // TODO: once we have the new color palette and style for pseudo classes
          [vars.accentDarker]: theme.colors.$blackAlpha700, // TODO: once we have the new color palette and style for pseudo classes
        },
      },
      variant: {
        solid: {
          backgroundColor: vars.accent,
          color: theme.colors.$colorTextOnPrimaryBackground,
          ...common.buttonShadow(theme),
          // '&:hover': { backgroundColor: vars.accentDark }, // TODO: once we have the new color palette
          '&:focus': props.hoverAsFocus ? { backgroundColor: vars.accentDark } : undefined,
          // '&:active': { backgroundColor: vars.accentDarker }, // TODO: once we have the new color palette
          ':after': {
            position: 'absolute',
            content: '""',
            borderRadius: 'inherit',
            zIndex: -1,
            inset: 0,
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.00) 100%)',
          },
        },
        outline: {
          color: vars.accent,
          boxShadow:
            '0px 2px 3px -1px rgba(0, 0, 0, 0.08), 0px 1px 0px 0px rgba(25, 28, 33, 0.02), 0px 0px 0px 1px rgba(25, 28, 33, 0.08)', // TODO: Move to theme once we have the shadows defined
          '&:hover': { backgroundColor: vars.accentLightest },
          '&:focus': props.hoverAsFocus ? { backgroundColor: vars.accentLightest } : undefined,
          '&:active': { backgroundColor: vars.accentLighter },
        },
        ghost: {
          color: vars.accent,
          '&:hover': { backgroundColor: vars.accentLightest },
          '&:focus': props.hoverAsFocus ? { backgroundColor: vars.accentLightest } : undefined,
          '&:active': { backgroundColor: vars.accentLighter },
        },
        icon: {
          color: vars.accent,
          boxShadow:
            '0px 2px 3px -1px rgba(0, 0, 0, 0.08), 0px 1px 0px 0px rgba(25, 28, 33, 0.02), 0px 0px 0px 1px rgba(25, 28, 33, 0.08)', // TODO: Move to theme once we have the shadows defined
          '&:hover': { backgroundColor: vars.accentLightest },
          '&:focus': props.hoverAsFocus ? { backgroundColor: vars.accentLightest } : undefined,
          '&:active': { backgroundColor: vars.accentLighter },
        },
        ghostIcon: {
          color: vars.accent,
          minHeight: theme.sizes.$6,
          width: theme.sizes.$6,
          padding: `${theme.space.$1} ${theme.space.$1}`,
          '&:hover': { color: vars.accentDark },
          '&:focus': props.hoverAsFocus ? { backgroundColor: vars.accentDark } : undefined,
          '&:active': { color: vars.accentDarker },
        },
        link: {
          ...common.textVariants(theme).smallRegular,
          minHeight: 'fit-content',
          height: 'fit-content',
          width: 'fit-content',
          textTransform: 'none',
          padding: 0,
          color: vars.accent,
          '&:hover': { textDecoration: 'underline' },
          '&:focus': props.hoverAsFocus ? { textDecoration: 'underline' } : undefined,
          '&:active': { color: vars.accentDark },
        },
        roundWrapper: { padding: 0, margin: 0, height: 'unset', width: 'unset', minHeight: 'unset' },
      },
      block: {
        true: { width: '100%' },
      },
      focusRing: {
        true: { ...common.focusRing(theme) },
      },
    },
    defaultVariants: {
      textVariant: 'buttonRegularRegular',
      colorScheme: 'primary',
      variant: 'solid',
      size: 'sm',
      focusRing: true,
    },
  };
});
type OwnProps = PrimitiveProps<'button'> & {
  isLoading?: boolean;
  loadingText?: string;
  isDisabled?: boolean;
  isActive?: boolean;
  hoverAsFocus?: boolean;
  hasArrow?: boolean;
};

type ButtonProps = OwnProps & StyleVariants<typeof applyVariants>;

const ButtonChildrenWithArrow = ({ children }: PropsWithChildren) => {
  return (
    <Flex
      align='center'
      gap={2}
    >
      {children}
      <Icon
        icon={ArrowRightButtonIcon}
        sx={t => ({
          width: t.sizes.$2x5,
          height: t.sizes.$2x5,
          opacity: t.opacity.$inactive,
        })}
      />
    </Flex>
  );
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const parsedProps: ButtonProps = { ...props, isDisabled: props.isDisabled || props.isLoading };
  const {
    isLoading,
    isDisabled,
    hoverAsFocus,
    loadingText,
    children,
    hasArrow,
    onClick: onClickProp,
    ...rest
  } = filterProps(parsedProps);

  const onClick: React.MouseEventHandler<HTMLButtonElement> = e => {
    if (rest.type !== 'submit') {
      e.preventDefault();
    }
    return onClickProp?.(e);
  };

  return (
    <button
      {...applyDataStateProps(rest)}
      // Explicitly remove type=submit or type=button
      // to prevent global css resets (eg tailwind) from affecting
      // the default styles of our components
      type={undefined}
      onClick={onClick}
      disabled={isDisabled}
      css={applyVariants(parsedProps) as any}
      ref={ref}
    >
      {isLoading && (
        <Flex
          as='span'
          gap={2}
          center
          css={{
            position: 'relative',
          }}
        >
          <Spinner
            aria-label={loadingText || 'Loading'}
            elementDescriptor={descriptors.spinner}
            sx={{
              position: loadingText ? undefined : 'absolute',
            }}
          />
          {loadingText || <span style={{ opacity: 0 }}>{children}</span>}
        </Flex>
      )}
      {!isLoading && (hasArrow ? <ButtonChildrenWithArrow>{children}</ButtonChildrenWithArrow> : children)}
    </button>
  );
});

const SimpleButton = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const parsedProps: ButtonProps = { ...props, isDisabled: props.isDisabled || props.isLoading };

  const { loadingText, isDisabled, hoverAsFocus, children, onClick: onClickProp, ...rest } = filterProps(parsedProps);

  const onClick: React.MouseEventHandler<HTMLButtonElement> = e => {
    if (rest.type !== 'submit') {
      e.preventDefault();
    }
    return onClickProp?.(e);
  };

  return (
    <button
      {...applyDataStateProps(rest)}
      // Explicitly remove type=submit or type=button
      // to prevent global css resets (eg tailwind) from affecting
      // the default styles of our components
      type={undefined}
      onClick={onClick}
      css={applyVariants(parsedProps) as any}
      disabled={isDisabled}
      ref={ref}
    >
      {children}
    </button>
  );
});

export { Button, SimpleButton };

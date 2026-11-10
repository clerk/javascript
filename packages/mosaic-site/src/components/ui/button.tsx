'use client';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { forwardRef, useState } from 'react';
import type { ButtonProps as RACButtonProps } from 'react-aria-components';
import { Button as RACButton } from 'react-aria-components';

const animation =
  'transition duration-300 ease-[cubic-bezier(0.4,0.36,0,1)] before:duration-300 before:ease-[cubic-bezier(0.4,0.36,0,1)] before:transition-opacity';

export const button = cva(
  ['group relative isolate inline-flex items-center justify-center overflow-hidden text-left font-medium', animation],
  {
    variants: {
      variant: {
        primary: [
          'rounded-md shadow-[0_1px_--theme(--color-white/0.07)_inset,0_1px_3px_--theme(--color-gray-900/0.2)]',
          'before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-md before:bg-linear-to-b before:from-white/20 before:opacity-50 hover:before:opacity-100',
          'after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-md after:bg-linear-to-b after:from-white/10 after:from-46% after:to-54% after:mix-blend-overlay',
        ],
        navigation: [
          'label-3 rounded-md shadow-[0_2px_3px_-1px_--theme(--color-black/0.08),0_0_0_0.5px_--theme(--color-gray-950/0.18),0_1px_0_0_--theme(--color-white/0.10)_inset]',
          '[background:linear-gradient(180deg,rgba(19,19,22,0)_45%,rgba(19,19,22,0.03)_55%),#fff] dark:[background:linear-gradient(180deg,rgba(255,255,255,0.04)_45%,rgba(255,255,255,0)_55%),#333333]',
          'dark:shadow-[0_2px_3px_-1px_--theme(--color-black/0.08),0_0_0_0.5px_rgba(247,247,248,0.10),0_1px_0_0_rgba(255,255,255,0.10)_inset]',
        ],
        secondary: ['text-gray-950'],
        translucent: [
          'rounded-md shadow-[0_1px_1px_-0.5px_rgba(0,0,0,0.03),0_2px_2px_-1px_rgba(0,0,0,0.03),0_4px_4px_-2px_rgba(0,0,0,0.03)]',
        ],
        glass: [
          'rounded-md text-white shadow-[inset_0_0_0_0.5px_--theme(--color-white/0.1),0_1px_1px_-0.5px_--theme(--color-black/0.03),0_2px_2px_-1px_--theme(--color-black/0.03),0_4px_4px_-2px_--theme(--color-black/0.03)]',
          'after:pointer-events-none after:absolute after:inset-0 after:rounded-md after:bg-linear-to-b after:from-white after:from-32% after:to-white/40 after:to-68% after:opacity-20',
        ],
      },
      size: {
        base: 'text-sm',
        xs: 'text-sm',
        sm: 'text-xs/4',
        icon: 'size-[1.875rem]',
      },
      color: {
        purple: null,
        sky: null,
        gray: null,
        lightGray: null,
        white: null,
        blue: null,
        lightBlue: null,
        orange: null,
        neutral: null,
        'neutral-inverted': null,
      },
      fullWidth: {
        true: 'w-full',
      },
      surface: {
        light: null,
        dark: null,
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'base',
      color: 'gray',
      fullWidth: false,
      surface: 'light',
    },
    compoundVariants: [
      { variant: 'primary', size: 'base', className: 'h-[1.875rem] px-3' },
      { variant: 'primary', size: 'xs', className: 'h-[1.625rem] px-2' },
      { variant: 'primary', size: 'sm', className: 'h-6 px-2' },
      { variant: 'primary', surface: 'light', className: 'ring-[0.5px]' },
      { variant: 'primary', color: 'purple', className: 'bg-purple-500 text-white ring-purple-500' },
      { variant: 'primary', color: 'blue', className: 'bg-blue-500 text-white ring-blue-500' },
      { variant: 'primary', color: 'lightBlue', className: 'bg-blue-200 text-blue-950 ring-blue-200' },
      { variant: 'primary', color: 'sky', className: 'bg-sky-400 text-sky-950 ring-sky-400' },
      { variant: 'primary', color: 'orange', className: 'bg-orange-500 text-white ring-orange-500' },
      { variant: 'primary', color: 'gray', className: 'bg-gray-900 text-white ring-gray-900' },
      { variant: 'primary', color: 'lightGray', className: 'bg-gray-700 text-white ring-gray-700' },
      { variant: 'primary', color: 'white', className: 'bg-white text-gray-950 ring-[#191C21]/8' },
      { variant: 'navigation', size: 'base', className: 'h-[1.875rem] px-2.5' },
      { variant: 'navigation', size: 'xs', className: 'h-[1.625rem] px-2.5' },
      { variant: 'navigation', size: 'sm', className: 'h-[1.875rem] px-2.5' },
      { variant: 'navigation', color: 'purple', className: 'bg-purple-500 text-white' },
      { variant: 'navigation', color: 'blue', className: 'bg-blue-500 text-white' },
      { variant: 'navigation', color: 'lightBlue', className: 'bg-blue-200 text-blue-950' },
      { variant: 'navigation', color: 'sky', className: 'bg-sky-400 text-sky-950' },
      { variant: 'navigation', color: 'orange', className: 'bg-orange-500 text-white' },
      { variant: 'navigation', color: 'gray', className: 'bg-gray-900 text-white' },
      { variant: 'navigation', color: 'lightGray', className: 'bg-gray-700 text-white' },
      { variant: 'navigation', color: 'white', className: 'text-gray-950 dark:text-gray-50' },
      {
        variant: 'primary',
        color: 'neutral',
        className: 'bg-gray-900 text-white ring-gray-900 dark:bg-white dark:text-gray-950 dark:ring-[#191C21]/8',
      },
      {
        variant: 'primary',
        color: 'neutral-inverted',
        className: 'bg-white text-gray-950 ring-[#191C21]/8 dark:bg-gray-900 dark:text-white dark:ring-gray-900',
      },
      { variant: 'secondary', color: 'gray', className: 'text-gray-950' },
      { variant: 'secondary', color: 'white', className: 'text-white' },
      { variant: 'secondary', color: 'purple', className: 'text-purple-500' },
      { variant: 'translucent', size: 'base', className: 'h-8 px-3' },
      { variant: 'translucent', color: 'white', className: 'bg-white/15 text-white hover:bg-white/20' },
      { variant: 'glass', size: 'base', className: 'py-1 pr-2 pl-3' },
    ],
  },
);

export function ArrowIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox='0 0 10 10'
      aria-hidden
      {...props}
    >
      <path
        fill='currentColor'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='m7.25 5-3.5-2.25v4.5L7.25 5Z'
      />
    </svg>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <>
      <ArrowIcon
        className={clsx(
          'ml-2 h-2.5 w-2.5 flex-none opacity-60 group-hover:translate-x-6 group-hover:opacity-0',
          className,
          animation,
        )}
      />
      <ArrowIcon
        className={clsx(
          '-ml-2.5 h-2.5 w-2.5 flex-none -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
          className,
          animation,
        )}
      />
    </>
  );
}

interface ButtonProps
  extends VariantProps<typeof button>, Pick<RACButtonProps, 'type' | 'isDisabled' | 'style' | 'slot'> {
  children: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  arrow?: boolean;
  onClick?: () => void;
  loading?: boolean;
  className?: string;
  sizer?: { children: string; icon?: React.ReactNode; iconPosition?: 'left' | 'right'; arrow?: boolean };
  textProps?: React.ComponentPropsWithoutRef<'span'>;
}

export const Button = forwardRef(function Button(
  {
    children,
    arrow = false,
    icon,
    iconPosition = 'left',
    type,
    isDisabled,
    loading,
    onClick,
    className,
    sizer = { children, icon, arrow },
    textProps,
    style,
    slot,
    ...variantProps
  }: ButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const [childrenInternal, setChildrenInternal] = useState(children);
  const [loadingInternal, setLoadingInternal] = useState(loading);
  const [key, setKey] = useState(0);

  if (children !== childrenInternal) {
    setChildrenInternal(children);
    setKey(k => k + 1);
  }

  if (loading !== loadingInternal) {
    setLoadingInternal(loading);
    setKey(k => k + 1);
  }

  const sizerIconPosition = sizer.iconPosition ?? iconPosition;
  const iconClassName = clsx(
    'block size-4 flex-none transform-gpu [backface-visibility:hidden]',
    variantProps.size !== 'icon' && (iconPosition === 'left' ? 'mr-2 -ml-1' : 'mr-0 ml-2'),
  );
  const sizerIconClassName = clsx(
    'block size-4 flex-none transform-gpu [backface-visibility:hidden]',
    variantProps.size !== 'icon' && (sizerIconPosition === 'left' ? 'mr-2 -ml-1' : 'mr-0 ml-2'),
  );

  return (
    <RACButton
      ref={ref}
      type={type}
      className={button({ ...variantProps, className })}
      isDisabled={isDisabled}
      onPress={onClick}
      style={style}
      slot={slot}
    >
      <span className='invisible inline-flex size-full items-center justify-center whitespace-nowrap'>
        {sizer.icon && sizerIconPosition === 'left' && (
          <svg
            viewBox='0 0 16 16'
            aria-hidden
            className={sizerIconClassName}
          >
            {sizer.icon}
          </svg>
        )}
        {sizer.children}
        {sizer.icon && sizerIconPosition === 'right' && (
          <svg
            viewBox='0 0 16 16'
            aria-hidden
            className={sizerIconClassName}
          >
            {sizer.icon}
          </svg>
        )}
        {sizer.arrow && <Arrow />}
      </span>

      <AnimatePresence
        initial={false}
        mode='popLayout'
      >
        {!loading && (
          <motion.span
            key={`${key}-children`}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              mass: 0.8,
            }}
            initial={{ transform: 'translateY(100%)' }}
            animate={{ transform: 'translateY(0%)' }}
            exit={{ transform: 'translateY(-100%)' }}
            className='absolute inset-0 inline-flex items-center justify-center whitespace-nowrap'
          >
            {icon && iconPosition === 'left' && (
              <svg
                viewBox='0 0 16 16'
                aria-hidden
                className={iconClassName}
              >
                {icon}
              </svg>
            )}
            <span {...textProps}>{children}</span>
            {icon && iconPosition === 'right' && (
              <svg
                viewBox='0 0 16 16'
                aria-hidden
                className={iconClassName}
              >
                {icon}
              </svg>
            )}
            {arrow && <Arrow />}
          </motion.span>
        )}
        {loading && (
          <motion.span
            key={`${key}-loading`}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              mass: 0.8,
            }}
            initial={{ transform: 'translateY(100%)' }}
            animate={{ transform: 'translateY(0%)' }}
            exit={{ transform: 'translateY(-100%)' }}
            className='absolute inset-0 inline-flex items-center justify-center'
          >
            <svg
              className='size-4 animate-spin [animation-duration:500ms]'
              fill='none'
              viewBox='0 0 20 20'
              strokeWidth='2'
              aria-hidden
            >
              <circle
                className='opacity-25'
                cx='10'
                cy='10'
                r='8'
                stroke='currentColor'
              />
              <path
                d='M10 2C5.58172 2 2 5.60236 2 10.0461C2 11.9146 2.63324 13.6343 3.69564 15'
                stroke='currentColor'
              />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </RACButton>
  );
});

type LinkButtonProps = React.ComponentPropsWithoutRef<'a'> &
  VariantProps<typeof button> & {
    href: string;
    children: React.ReactNode;
    arrow?: boolean;
    newTab?: boolean;
    ariaLabel?: string;
  };

export function LinkButton({
  href,
  children,
  arrow = false,
  newTab = false,
  ariaLabel,
  variant,
  size,
  color,
  fullWidth,
  surface,
  className,
  ...props
}: LinkButtonProps) {
  const shouldUseAnchor = !href || href.startsWith('#') || href.startsWith('https://');
  const Component = shouldUseAnchor ? 'a' : Link;

  return (
    <Component
      href={href}
      className={button({ variant, size, color, fullWidth, surface, className })}
      target={newTab ? '_blank' : undefined}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
      {arrow && <Arrow />}
    </Component>
  );
}

export { Button as RACButton } from 'react-aria-components';

import cn from 'clsx';
import * as React from 'react';

import { Logo } from './logo';

const Root = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Root(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn(
        'bg-background rounded-lg w-96 relative overflow-hidden shadow-[0_0_0_1px_theme(colors.neutral/.06),0_15px_35px_-5px_rgba(25,28,33,0.20),0_5px_15px_0_theme(colors.black/.08)]',
        className,
      )}
    >
      {children}
    </div>
  );
});

const Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Content(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn(
        'rounded-lg bg-background py-8 px-10 space-y-8 relative shadow-[0_0_0_1px_theme(colors.neutral/.03),0_1px_2px_0_rgba(25,28,33,0.06),0_0_2px_0_theme(colors.black/.08)]',
        className,
      )}
    >
      {children}
    </div>
  );
});

const Header = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Header(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn('text-center', className)}
    >
      {children}
    </div>
  );
});

const Title = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(function Title(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <h2
      ref={forwardedRef}
      {...props}
      className={cn('text-[1.0625rem]/6 font-bold text-foreground', className)}
    >
      {children}
    </h2>
  );
});

const Description = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(function Description(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <p
      ref={forwardedRef}
      {...props}
      className={cn('text-[0.8125rem]/[1.125rem] text-foreground/60', className)}
    >
      {children}
    </p>
  );
});

const Body = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Body(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn('rounded-lg space-y-6', className)}
    >
      {children}
    </div>
  );
});

const Footer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Footer(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn('-mt-2 pt-2 bg-neutral/[.03] rounded-b-lg', className)}
    >
      {children}
      <div className='py-4 px-6 border-t border-neutral/5 grid place-content-center'>
        <p className='text-xs inline-flex items-center gap-x-1 text-foreground/60'>
          Secured by{' '}
          <a
            aria-label='Clerk logo'
            href='https://www.clerk.com?utm_source=clerk&amp;utm_medium=components'
            target='_blank'
            rel='noopener'
          >
            <Logo />
          </a>
        </p>
      </div>
    </div>
  );
});

const FooterAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function FooterAction(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn('px-6 py-4', className)}
    >
      {children}
    </div>
  );
});

const FooterActionText = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function FooterActionText({ children, className, ...props }, forwardedRef) {
    return (
      <p
        ref={forwardedRef}
        {...props}
        className={cn('text-foreground/60 text-[0.8125rem]/[1.125rem] text-center', className)}
      >
        {children}
      </p>
    );
  },
);

const FooterActionLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function FooterActionLink({ children, className, ...props }, forwardedRef) {
    return (
      <a
        ref={forwardedRef}
        {...props}
        className={cn('text-primary text-[0.8125rem]/[1.125rem] font-medium hover:underline', className)}
      >
        {children}
      </a>
    );
  },
);

export { Root, Content, Header, Title, Description, Body, Footer, FooterAction, FooterActionText, FooterActionLink };

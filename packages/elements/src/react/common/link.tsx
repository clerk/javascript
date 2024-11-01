import { useClerkRouter } from '@clerk/shared/router';
import { Slot } from '@radix-ui/react-slot';

export interface LinkProps extends React.ButtonHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
  href: string;
}

export function Link({ asChild, href, ...rest }: LinkProps) {
  const router = useClerkRouter();
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      onClick={e => {
        if (router) {
          e.preventDefault();
          router.push(href);
        }
      }}
      href={href}
      {...rest}
    />
  );
}

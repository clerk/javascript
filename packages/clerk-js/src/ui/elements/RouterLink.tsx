import { Link } from '../customizables';
import { useRouter } from '../router';
import type { PropsOfComponent } from '../styledSystem';

type RouterLinkProps = PropsOfComponent<typeof Link> & {
  to?: string;
};

export const RouterLink = (props: RouterLinkProps) => {
  const { to, onClick: onClickProp, ...rest } = props;
  const router = useRouter();

  const toUrl = router.resolve(to || router.indexPath);

  const onClick: React.MouseEventHandler<HTMLAnchorElement> = e => {
    e.preventDefault();
    if (onClickProp && !to) {
      return onClickProp(e);
    }
    return router.navigate(toUrl.href);
  };

  return (
    <Link
      {...rest}
      onClick={onClick}
      href={toUrl.href}
    />
  );
};

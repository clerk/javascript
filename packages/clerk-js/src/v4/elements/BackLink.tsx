import React from 'react';

import { useRouter } from '../../ui/router/RouteContext';
import { Flex, Icon, Link } from '../customizables';
import { ArrowLeftIcon } from '../icons';
import { PropsOfComponent } from '../styledSystem';

type BackLinkProps = PropsOfComponent<typeof Link> & {
  to?: string;
};

export const BackLink = (props: BackLinkProps) => {
  const router = useRouter();
  const { to, onClick: onClickProp, ...rest } = props;

  const toUrl = router.resolve(to || router.indexPath);

  const onClick: React.MouseEventHandler<HTMLAnchorElement> = e => {
    e.preventDefault();
    if (onClickProp && !to) {
      return onClickProp(e);
    }
    return router.navigate(toUrl.href);
  };

  return (
    <Flex sx={theme => ({ marginBottom: theme.space.$4 })}>
      <Link
        {...rest}
        onClick={onClick}
        href={toUrl.href}
        sx={theme => ({ gap: theme.space.$1 })}
      >
        <Icon icon={ArrowLeftIcon} />
        Back
      </Link>
    </Flex>
  );
};

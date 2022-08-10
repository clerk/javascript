import React from 'react';

import { useRouter } from '../router';
import { descriptors, Flex, Icon, Link, Text } from '../customizables';
import { mqu, PropsOfComponent } from '../styledSystem';
import { BaseRoutes } from './Navbar';
import { useNavigateToFlowStart } from './NavigateToFlowStartButton';

type BreadcrumbsProps = {
  title: string;
};

const BreadcrumbItem = (props: PropsOfComponent<typeof Text> & { href?: string }) => {
  const El = (props.onClick || props.href ? Link : Text) as unknown as any;
  return (
    <Flex
      elementDescriptor={descriptors.breadcrumbsItemBox}
      as='li'
    >
      <El
        elementDescriptor={descriptors.breadcrumbsItem}
        colorScheme='neutral'
        variant='smallRegular'
        sx={{ display: 'inline-flex', listStyle: 'none' }}
        {...props}
      />
    </Flex>
  );
};

const PAGE_TO_ROOT = {
  profile: BaseRoutes.find(r => r.id === 'account'),
  'email-address': BaseRoutes.find(r => r.id === 'account'),
  'phone-number': BaseRoutes.find(r => r.id === 'account'),
  'connected-account': BaseRoutes.find(r => r.id === 'account'),
  'web3-wallet': BaseRoutes.find(r => r.id === 'account'),
  username: BaseRoutes.find(r => r.id === 'account'),
  'multi-factor': BaseRoutes.find(r => r.id === 'security'),
  password: BaseRoutes.find(r => r.id === 'security'),
};

export const Breadcrumbs = (props: BreadcrumbsProps) => {
  const router = useRouter();
  const { navigateToFlowStart } = useNavigateToFlowStart();
  const currentPage = (router.currentPath || '').split('/').pop();

  const { title } = props;
  if (!title) {
    return null;
  }

  // @ts-expect-error
  const root = currentPage ? PAGE_TO_ROOT[currentPage] : undefined;
  const handleRootClick = (e: React.MouseEvent) => {
    e.preventDefault();
    return navigateToFlowStart();
  };

  return (
    <Flex
      as='nav'
      elementDescriptor={descriptors.breadcrumbs}
    >
      <Flex
        elementDescriptor={descriptors.breadcrumbsItems}
        as='ol'
        sx={t => ({
          gap: t.space.$3,
          [mqu.xs]: { gap: t.space.$1 },
          margin: 0,
          padding: 0,
        })}
      >
        {root && (
          <>
            <BreadcrumbItem
              href=''
              onClick={handleRootClick}
            >
              <Icon
                elementDescriptor={descriptors.breadcrumbsItemIcon}
                icon={root.icon}
                size={'sm'}
                sx={t => ({
                  [mqu.xs]: { display: 'none' },
                  opacity: 0.7,
                  marginRight: t.space.$2,
                })}
              />
              {root.name}
            </BreadcrumbItem>
            <BreadcrumbItem
              elementDescriptor={descriptors.breadcrumbsItemDivider}
              aria-hidden
            >
              /
            </BreadcrumbItem>
          </>
        )}
        <BreadcrumbItem
          elementDescriptor={descriptors.breadcrumbsItem}
          elementId={descriptors.breadcrumbsItem.setId('currentPage')}
          colorScheme='primary'
        >
          {title}
        </BreadcrumbItem>
      </Flex>
    </Flex>
  );
};

import React, { useMemo } from 'react';

import type { LocalizationKey } from '../customizables';
import { descriptors, Flex, Icon, Link, Text, useLocalizations } from '../customizables';
import { useNavigateToFlowStart } from '../hooks';
import { useRouter } from '../router';
import type { PropsOfComponent } from '../styledSystem';
import { mqu } from '../styledSystem';
import type { NavbarRoute } from './Navbar';

type BreadcrumbsProps = {
  title: LocalizationKey;
  pageToRootNavbarRoute: Record<string, NavbarRoute | undefined>;
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

export const Breadcrumbs = (props: BreadcrumbsProps) => {
  const { title, pageToRootNavbarRoute, ...rest } = props;
  const router = useRouter();
  const { navigateToFlowStart } = useNavigateToFlowStart();
  const { t } = useLocalizations();
  const currentPath = router.currentPath.replace(`/${router.basePath}/`, '');

  const root = useMemo(
    () =>
      Object.entries(pageToRootNavbarRoute).find(([key]) => {
        return currentPath.includes(key);
      })?.[1],
    [],
  );

  if (!title) {
    return null;
  }

  const handleRootClick = (e: React.MouseEvent) => {
    e.preventDefault();
    return navigateToFlowStart();
  };

  return (
    <Flex
      as='nav'
      elementDescriptor={descriptors.breadcrumbs}
      {...rest}
    >
      <Flex
        elementDescriptor={descriptors.breadcrumbsItems}
        as='ol'
        sx={t => ({
          gap: t.space.$3,
          [mqu.sm]: { gap: t.space.$1 },
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
                  [mqu.sm]: { display: 'none' },
                  opacity: 0.7,
                  marginRight: t.space.$2,
                })}
              />
              {t(root.name)}
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
          localizationKey={title}
          elementDescriptor={descriptors.breadcrumbsItem}
          elementId={descriptors.breadcrumbsItem.setId('currentPage')}
          colorScheme='primary'
        />
      </Flex>
    </Flex>
  );
};

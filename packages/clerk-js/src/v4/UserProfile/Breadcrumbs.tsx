import React from 'react';

import { useRouter } from '../../ui/router';
import { descriptors, Flex, Icon, Text } from '../customizables';
import { mqu, PropsOfComponent } from '../styledSystem';
import { BaseRoutes } from './Navbar';

type BreadcrumbsProps = {
  title: string;
};

const BreadcrumbItem = (props: PropsOfComponent<typeof Text>) => {
  return (
    <Text
      as='li'
      colorScheme='neutral'
      variant='smallRegular'
      sx={{ display: 'inline-flex', listStyle: 'none' }}
      {...props}
    />
  );
};

export const Breadcrumbs = (props: BreadcrumbsProps) => {
  const router = useRouter();
  const { title } = props;
  if (!title) {
    return null;
  }
  const root = BaseRoutes.find(r => router.currentPath.includes(r.path));
  return (
    <Flex
      as='nav'
      elementDescriptor={descriptors.breadcrumbs}
    >
      <Flex
        elementDescriptor={descriptors.breadcrumbsItemContainer}
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
            <BreadcrumbItem elementDescriptor={descriptors.breadcrumbsItem}>
              <Icon
                elementDescriptor={descriptors.breadcrumbsIcon}
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
              elementDescriptor={descriptors.breadcrumbsDivider}
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

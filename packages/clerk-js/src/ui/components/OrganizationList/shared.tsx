import type { UserOrganizationInvitationResource } from '@clerk/types';
import type { PropsWithChildren } from 'react';
import { forwardRef } from 'react';

import { Box, Button, Col, descriptors, Flex, Spinner } from '../../customizables';
import { OrganizationPreview, PreviewButton } from '../../elements';
import { ArrowRightIcon } from '../../icons';
import type { ThemableCssProp } from '../../styledSystem';
import { common } from '../../styledSystem';

export const PreviewListItems = (props: PropsWithChildren) => {
  return (
    <Col
      elementDescriptor={descriptors.organizationListPreviewItems}
      sx={t => ({
        maxHeight: `calc(8 * ${t.sizes.$12})`,
        overflowY: 'auto',
        ...common.unstyledScrollbar(t),
      })}
    >
      {props.children}
    </Col>
  );
};

const sharedStyles: ThemableCssProp = t => ({
  height: t.space.$14,
  padding: `${t.space.$2} ${t.space.$8}`,
});

export const PreviewListItem = (
  props: PropsWithChildren<{
    organizationData: UserOrganizationInvitationResource['publicOrganizationData'];
  }>,
) => {
  return (
    <Flex
      align='center'
      gap={2}
      sx={[
        _ => ({
          minHeight: 'unset',
          justifyContent: 'space-between',
        }),
        sharedStyles,
      ]}
      elementDescriptor={descriptors.organizationListPreviewItem}
    >
      <OrganizationPreview
        elementId='organizationList'
        avatarSx={t => ({ width: t.sizes.$10, height: t.sizes.$10 })}
        mainIdentifierSx={t => ({
          fontSize: t.fontSizes.$xl,
          color: t.colors.$colorText,
        })}
        organization={props.organizationData}
      />
      {props.children}
    </Flex>
  );
};

export const PreviewListSpinner = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <Box
      ref={ref}
      sx={t => ({
        width: '100%',
        height: t.space.$12,
        position: 'relative',
      })}
    >
      <Box
        sx={{
          margin: 'auto',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translateY(-50%) translateX(-50%)',
        }}
      >
        <Spinner
          size='md'
          colorScheme='primary'
        />
      </Box>
    </Box>
  );
});

export const PreviewListItemButton = (props: Parameters<typeof Button>[0]) => {
  return (
    <Button
      elementDescriptor={descriptors.organizationListPreviewItemActionButton}
      textVariant='buttonExtraSmallBold'
      variant='outline'
      colorScheme='neutral'
      size='sm'
      {...props}
    />
  );
};

export const OrganizationListPreviewButton = (props: PropsWithChildren<{ onClick: () => void | Promise<void> }>) => {
  return (
    <PreviewButton
      elementDescriptor={descriptors.organizationListPreviewButton}
      sx={[sharedStyles]}
      icon={ArrowRightIcon}
      iconProps={{
        size: 'lg',
      }}
      showIconOnHover={false}
      {...props}
    />
  );
};

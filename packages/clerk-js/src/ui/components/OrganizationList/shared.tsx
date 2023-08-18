import { Box, Button, descriptors, Flex, Spinner, Text } from '../../customizables';
import { Header, OrganizationPreview } from '../../elements';
import { forwardRef, PropsWithChildren } from 'react';
import { UserOrganizationInvitationResource } from '@clerk/types';
import { common } from '../../styledSystem';

export const PreviewList = (
  props: PropsWithChildren<{
    elementId: Parameters<typeof descriptors.organizationListPreviewList.setId>[0];
  }>,
) => {
  return (
    <Flex
      direction='col'
      elementDescriptor={descriptors.organizationListPreviewList}
      gap={2}
    >
      {props.children}
    </Flex>
  );
};

export const PreviewListSubtitle = (props: Parameters<typeof Text>[0]) => {
  return (
    <Header.Root>
      <Header.Subtitle
        elementDescriptor={descriptors.organizationListPreviewListSubtitle}
        sx={t => ({
          lineHeight: t.sizes.$7,
          padding: `${t.space.$none} ${t.space.$8}`,
        })}
        {...props}
      />
    </Header.Root>
  );
};

export const PreviewListDivider = () => {
  return (
    <Box
      elementDescriptor={descriptors.organizationListPreviewListDivider}
      sx={t => ({
        margin: `${t.space.$2} ${t.space.$8} ${t.space.$none} ${t.space.$8}`,
        borderBottom: `${t.borders.$normal} ${t.colors.$blackAlpha200}`,
      })}
    />
  );
};

export const PreviewListItems = (props: PropsWithChildren) => {
  return (
    <Box
      elementDescriptor={descriptors.organizationListPreviewItems}
      sx={t => ({
        maxHeight: `calc(4 * ${t.sizes.$12})`,
        overflowY: 'auto',
        ...common.unstyledScrollbar(t),
      })}
    >
      {props.children}
    </Box>
  );
};

export const PreviewListItem = (
  props: PropsWithChildren<{
    organizationData: UserOrganizationInvitationResource['publicOrganizationData'];
  }>,
) => {
  return (
    <Flex
      align='center'
      gap={2}
      sx={t => ({
        minHeight: 'unset',
        height: t.space.$12,
        justifyContent: 'space-between',
        padding: `0 ${t.space.$8}`,
      })}
      elementDescriptor={descriptors.organizationListPreviewItem}
    >
      <OrganizationPreview
        elementId='organizationList'
        avatarSx={t => ({ margin: `0 calc(${t.space.$3}/2)`, width: t.sizes.$10, height: t.sizes.$10 })}
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
      variant='solid'
      size='sm'
      {...props}
    />
  );
};

export const PreviewListItemDestructiveButton = (props: Parameters<typeof Button>[0]) => {
  return (
    <Button
      elementDescriptor={descriptors.organizationListPreviewItemDestructiveActionButton}
      textVariant='buttonExtraSmallBold'
      variant='solid'
      size='sm'
      {...props}
    />
  );
};

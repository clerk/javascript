import type { UserOrganizationInvitationResource } from '@clerk/types';
import type { PropsWithChildren } from 'react';
import { forwardRef } from 'react';

import { Box, Button, Col, descriptors, Flex, Spinner } from '../../customizables';
import { OrganizationPreview, PreviewButton } from '../../elements';
import { SwitchArrowRight } from '../../icons';
import type { ThemableCssProp } from '../../styledSystem';
import { common } from '../../styledSystem';

export const PreviewListItems = (props: PropsWithChildren) => {
  return (
    <Col
      elementDescriptor={descriptors.organizationListPreviewItems}
      sx={t => ({
        maxHeight: `calc(8 * ${t.sizes.$12})`,
        overflowY: 'auto',
        borderTopWidth: t.borderWidths.$normal,
        borderTopStyle: t.borderStyles.$solid,
        borderTopColor: t.colors.$neutralAlpha100,
        ...common.unstyledScrollbar(t),
      })}
    >
      {props.children}
    </Col>
  );
};

const sharedStyles: ThemableCssProp = t => ({
  padding: `${t.space.$4} ${t.space.$5}`,
});

export const sharedMainIdentifierSx: ThemableCssProp = t => ({
  color: t.colors.$colorText,
  ':hover': {
    color: t.colors.$colorText,
  },
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
        t => ({
          minHeight: 'unset',
          justifyContent: 'space-between',
          borderTopWidth: t.borderWidths.$normal,
          borderTopStyle: t.borderStyles.$solid,
          borderTopColor: t.colors.$neutralAlpha100,
        }),
        sharedStyles,
      ]}
      elementDescriptor={descriptors.organizationListPreviewItem}
    >
      <OrganizationPreview
        elementId='organizationList'
        mainIdentifierSx={sharedMainIdentifierSx}
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
          size='sm'
          colorScheme='primary'
          elementDescriptor={descriptors.spinner}
        />
      </Box>
    </Box>
  );
});

export const PreviewListItemButton = (props: Parameters<typeof Button>[0]) => {
  return (
    <Button
      elementDescriptor={descriptors.organizationListPreviewItemActionButton}
      textVariant='buttonSmall'
      variant='outline'
      size='xs'
      {...props}
    />
  );
};

export const OrganizationListPreviewButton = (props: PropsWithChildren<{ onClick: () => void | Promise<void> }>) => {
  return (
    <PreviewButton
      elementDescriptor={descriptors.organizationListPreviewButton}
      sx={[sharedStyles]}
      icon={SwitchArrowRight}
      {...props}
    />
  );
};

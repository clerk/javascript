import type { UserOrganizationInvitationResource } from '@clerk/types';
import type { PropsWithChildren } from 'react';
import { forwardRef } from 'react';

import type { ElementDescriptor } from '@/ui/customizables/elementDescriptors';
import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { PreviewButton } from '@/ui/elements/PreviewButton';

import { Box, Button, Col, descriptors, Flex, Spinner } from '../../customizables';
import { SwitchArrowRight } from '../../icons';
import type { ThemableCssProp } from '../../styledSystem';
import { common } from '../../styledSystem';

export const OrganizationPreviewListItems = (props: PropsWithChildren) => {
  return (
    <Col
      elementDescriptor={descriptors.organizationListPreviewItems}
      sx={t => ({
        maxHeight: `calc(8 * ${t.sizes.$12})`,
        overflowY: 'auto',
        borderTopWidth: t.borderWidths.$normal,
        borderTopStyle: t.borderStyles.$solid,
        borderTopColor: t.colors.$borderAlpha100,
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
  color: t.colors.$colorForeground,
  ':hover': {
    color: t.colors.$colorForeground,
  },
});

type OrganizationPreviewListItemProps = PropsWithChildren<{
  elementId: React.ComponentProps<typeof OrganizationPreview>['elementId'];
  organizationData: UserOrganizationInvitationResource['publicOrganizationData'];
}>;

export const OrganizationPreviewListItem = ({
  children,
  elementId,
  organizationData,
}: OrganizationPreviewListItemProps) => {
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
          borderTopColor: t.colors.$borderAlpha100,
        }),
        sharedStyles,
      ]}
      elementDescriptor={descriptors.organizationListPreviewItem}
    >
      <OrganizationPreview
        elementId={elementId}
        mainIdentifierSx={sharedMainIdentifierSx}
        organization={organizationData}
      />
      {children}
    </Flex>
  );
};

export const OrganizationPreviewListSpinner = forwardRef<HTMLDivElement>((_, ref) => {
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

export const OrganizationPreviewListItemButton = (props: Parameters<typeof Button>[0]) => {
  return (
    <Button
      textVariant='buttonSmall'
      variant='outline'
      size='xs'
      {...props}
    />
  );
};

type OrganizationListPreviewButtonProps = PropsWithChildren<{
  onClick: () => void | Promise<void>;
  elementDescription: ElementDescriptor;
}>;

// TODO - Reuse those components on OrganizationList as well
export const OrganizationListPreviewButton = (props: OrganizationListPreviewButtonProps) => {
  return (
    <PreviewButton
      elementDescriptor={props.elementDescription}
      sx={[sharedStyles]}
      icon={SwitchArrowRight}
      {...props}
    />
  );
};

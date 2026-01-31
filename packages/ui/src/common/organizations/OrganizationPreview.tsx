import type { UserOrganizationInvitationResource } from '@clerk/shared/types';
import type { PropsWithChildren } from 'react';
import { forwardRef } from 'react';

import type { ElementDescriptor } from '@/ui/customizables/elementDescriptors';
import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { PreviewButton } from '@/ui/elements/PreviewButton';

import { Box, Button, Col, descriptors, Flex, Spinner } from '../../customizables';
import { SwitchArrowRight } from '../../icons';
import type { ThemableCssProp } from '../../styledSystem';
import { common } from '../../styledSystem';

type OrganizationPreviewListItemsProps = PropsWithChildren<{
  elementDescriptor: ElementDescriptor;
}>;

export const OrganizationPreviewListItems = ({ elementDescriptor, children }: OrganizationPreviewListItemsProps) => {
  return (
    <Col
      elementDescriptor={elementDescriptor}
      sx={t => ({
        maxHeight: `calc(8 * ${t.sizes.$12})`,
        overflowY: 'auto',
        borderTopWidth: t.borderWidths.$normal,
        borderTopStyle: t.borderStyles.$solid,
        borderTopColor: t.colors.$borderAlpha100,
        ...common.unstyledScrollbar(t),
      })}
    >
      {children}
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
  elementDescriptor: React.ComponentProps<typeof OrganizationPreview>['elementDescriptor'];
  organizationData: UserOrganizationInvitationResource['publicOrganizationData'];
}>;

export const OrganizationPreviewListItem = ({
  children,
  elementId,
  elementDescriptor,
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
      elementDescriptor={elementDescriptor}
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

export const OrganizationPreviewSpinner = forwardRef<HTMLDivElement>((_, ref) => {
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
          // eslint-disable-next-line custom-rules/no-physical-css-properties -- Centering with transform: translateX(-50%)
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

type OrganizationPreviewButtonProps = PropsWithChildren<{
  onClick: () => void | Promise<void>;
  elementDescriptor: ElementDescriptor;
}>;

export const OrganizationPreviewButton = (props: OrganizationPreviewButtonProps) => {
  return (
    <PreviewButton
      sx={[sharedStyles]}
      icon={SwitchArrowRight}
      {...props}
    />
  );
};

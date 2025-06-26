import { iconImageUrl } from '@clerk/shared/constants';
import React from 'react';

import { Button, descriptors, Flex, Icon, Text } from '../customizables';
import { PencilEdit } from '../icons';
import type { PropsOfComponent } from '../styledSystem';
import { formatSafeIdentifier, isMaskedIdentifier } from '../utils/formatSafeIdentifier';
import { getFlagEmojiFromCountryIso, parsePhoneString } from '../utils/phoneUtils';

type IdentityPreviewProps = {
  avatarUrl: string | null | undefined;
  identifier: string | null | undefined;
  onClick?: React.MouseEventHandler;
} & PropsOfComponent<typeof Flex>;

export const IdentityPreview = (props: IdentityPreviewProps) => {
  const { avatarUrl = iconImageUrl('avatar_placeholder', 'jpeg'), identifier, onClick, ...rest } = props;
  const refs = React.useRef({ avatarUrl, identifier: formatSafeIdentifier(identifier) });

  const edit = onClick && (
    <Button
      elementDescriptor={descriptors.identityPreviewEditButton}
      variant='link'
      textVariant='buttonSmall'
      onClick={onClick}
      aria-label={'Edit'}
    >
      <Icon
        elementDescriptor={descriptors.identityPreviewEditButtonIcon}
        icon={PencilEdit}
      />
    </Button>
  );

  if (!refs.current.identifier) {
    return <Container {...rest}>{edit}</Container>;
  }

  if (isMaskedIdentifier(refs.current.identifier) || !refs.current.identifier.startsWith('+')) {
    return (
      <Container {...rest}>
        <UsernameOrEmailIdentifier {...refs.current} />
        {edit}
      </Container>
    );
  }

  const parsedPhone = parsePhoneString(refs.current.identifier || '');
  const flag = getFlagEmojiFromCountryIso(parsedPhone.iso);
  return (
    <Container {...rest}>
      <PhoneIdentifier
        identifier={refs.current.identifier}
        flag={flag}
      />
      {edit}
    </Container>
  );
};

const IdentifierContainer = (props: React.PropsWithChildren) => {
  return (
    <Text
      elementDescriptor={descriptors.identityPreviewText}
      colorScheme='secondary'
      truncate
      {...props}
    />
  );
};

const UsernameOrEmailIdentifier = (props: any) => {
  return <IdentifierContainer>{props.identifier}</IdentifierContainer>;
};

const PhoneIdentifier = (props: { identifier: string; flag?: string }) => {
  return (
    <>
      <Text sx={t => ({ fontSize: t.fontSizes.$sm })}>{props.flag}</Text>
      <IdentifierContainer>{props.identifier}</IdentifierContainer>
    </>
  );
};

const Container = (props: React.PropsWithChildren) => {
  return (
    <Flex
      elementDescriptor={descriptors.identityPreview}
      align='center'
      gap={2}
      sx={{
        justifyContent: 'center',
      }}
      {...props}
    />
  );
};

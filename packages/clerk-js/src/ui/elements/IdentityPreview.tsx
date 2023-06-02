import React from 'react';

import { Button, descriptors, Flex, Icon, Text } from '../customizables';
import { UserAvatar } from '../elements';
import { AuthApp, PencilEdit } from '../icons';
import type { PropsOfComponent } from '../styledSystem';
import { formatSafeIdentifier, getFlagEmojiFromCountryIso, isMaskedIdentifier, parsePhoneString } from '../utils';

type IdentityPreviewProps = {
  avatarUrl: string | null | undefined;
  identifier: string | null | undefined;
  onClick?: React.MouseEventHandler;
} & PropsOfComponent<typeof Flex>;

export const IdentityPreview = (props: IdentityPreviewProps) => {
  const { avatarUrl = 'https://img.clerk.com/static/avatar_placeholder.jpeg', identifier, onClick, ...rest } = props;
  const refs = React.useRef({ avatarUrl, identifier: formatSafeIdentifier(identifier) });

  const edit = onClick && (
    <Button
      elementDescriptor={descriptors.identityPreviewEditButton}
      variant='ghostIcon'
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
    return (
      <Container {...rest}>
        <Authenticator />
        {edit}
      </Container>
    );
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

const IdentifierContainer = (props: React.PropsWithChildren<{}>) => {
  return (
    <Text
      elementDescriptor={descriptors.identityPreviewText}
      variant='smallRegular'
      colorScheme='neutral'
      truncate
      {...props}
    />
  );
};

const UsernameOrEmailIdentifier = (props: any) => {
  return (
    <>
      <UserAvatar
        boxElementDescriptor={descriptors.identityPreviewAvatarBox}
        imageElementDescriptor={descriptors.identityPreviewAvatarImage}
        avatarUrl={props.avatarUrl}
        size={t => t.sizes.$5}
      />
      <IdentifierContainer>{props.identifier}</IdentifierContainer>
    </>
  );
};

const PhoneIdentifier = (props: { identifier: string; flag?: string }) => {
  return (
    <>
      <Text sx={t => ({ fontSize: t.fontSizes.$sm })}>{props.flag}</Text>
      <IdentifierContainer>{props.identifier}</IdentifierContainer>
    </>
  );
};

const Authenticator = () => {
  return (
    <>
      <Icon
        icon={AuthApp}
        sx={t => ({ color: t.colors.$blackAlpha700 })}
      />
      <IdentifierContainer>Authenticator app</IdentifierContainer>
    </>
  );
};

const Container = (props: React.PropsWithChildren<{}>) => {
  return (
    <Flex
      elementDescriptor={descriptors.identityPreview}
      align='center'
      gap={2}
      sx={t => ({
        minHeight: t.space.$9x5,
        maxWidth: 'fit-content',
        backgroundColor: t.colors.$blackAlpha20,
        padding: `${t.space.$1x5} ${t.space.$4}`,
        borderRadius: t.radii.$2xl,
        border: `${t.borders.$normal} ${t.colors.$blackAlpha200}`,
      })}
      {...props}
    ></Flex>
  );
};

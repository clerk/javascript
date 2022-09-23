import React from 'react';

import { getFullName, getIdentifier } from '../../ui/utils';
import { useCoreClerk, useCoreSession } from '../contexts';
import { Col, Flex, Icon, Link, Text, useAppearance } from '../customizables';
import { Portal } from '../elements/Portal';
import { Eye } from '../icons';

type EyeCircleProps = {
  width: string;
  height: string;
};

const EyeCircle = ({ width, height }: EyeCircleProps) => {
  return (
    <Col
      id='cl-impersonationEye'
      justify='center'
      sx={t => ({
        width,
        height,
        transition: `transform ${t.transitionDuration.$slowest}`,
        backgroundColor: t.colors.$danger500,
        borderRadius: t.radii.$circle,
      })}
    >
      <Icon
        sx={{
          margin: 'auto',
        }}
        icon={Eye}
        size={undefined}
      />
    </Col>
  );
};

type FabContentProps = { userId: string };

const FabContent = ({ userId }: FabContentProps) => {
  const { signOut } = useCoreClerk();

  return (
    <Col
      sx={t => ({
        whiteSpace: 'nowrap',
        paddingLeft: t.sizes.$4,
        paddingRight: t.sizes.$6,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
      })}
    >
      <Text
        colorScheme='neutral'
        variant='regularMedium'
      >
        Signed in as {userId}
      </Text>
      <Link
        variant='regularMedium'
        sx={t => ({
          alignSelf: 'flex-start',
          color: t.colors.$primary500,
          ':hover': {
            cursor: 'pointer',
          },
        })}
        onClick={async () => {
          await signOut();
          window.close();
          //TODO: add timeout with redirect here
        }}
      >
        Sign out and close tab
      </Link>
    </Col>
  );
};

export const ImpersonationFab = () => {
  const session = useCoreSession();
  const { parsedInternalTheme } = useAppearance();
  const actor = session?.actor;
  const isImpersonating = !!actor;

  //essentials for calcs
  const top = '109px';
  const right = '23px';
  const eyeWidth = parsedInternalTheme.sizes.$16;
  const eyeHeight = eyeWidth;

  if (!isImpersonating || !session.user) {
    return null;
  }

  return (
    <Portal>
      <Flex
        align='center'
        sx={t => ({
          position: 'fixed',
          overflow: 'hidden',
          top,
          right,
          zIndex: t.zIndices.$fab,
          boxShadow: t.shadows.$fabShadow,
          borderRadius: t.radii.$halfHeight, //to match the circular eye perfectly
          backgroundColor: t.colors.$white,
          fontFamily: t.fonts.$main,
          ':hover #cl-impersonationText': {
            maxWidth: `calc(min(100vw, 45ch) - ${eyeWidth} - ${right})`,
          },
          ':hover #cl-impersonationEye': {
            transform: 'rotate(-180deg)',
          },
        })}
      >
        <EyeCircle
          width={eyeWidth}
          height={eyeHeight}
        />

        <Flex
          id='cl-impersonationText'
          sx={t => ({
            maxWidth: '0px',
            transition: `max-width ${t.transitionDuration.$slowest}`,
          })}
        >
          <FabContent userId={getFullName(session.user) || getIdentifier(session.user)} />
        </Flex>
      </Flex>
    </Portal>
  );
};

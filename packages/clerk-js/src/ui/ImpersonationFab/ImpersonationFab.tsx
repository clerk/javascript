import React from 'react';

import { useCoreClerk, useCoreSession } from '../contexts';
import { Col, Flex, Icon, Link, Text, useAppearance } from '../customizables';
import { Portal } from '../elements/Portal';
import { Eye } from '../icons';

type EyeCircleProps = {
  width: string;
  height: string;
  padding: string;
};

const EyeCircle: React.FC<EyeCircleProps> = ({ width, height, padding }) => {
  return (
    <Flex
      id='impersonationEye'
      sx={t => ({
        padding,
        transition: 'transform 800ms',
        backgroundColor: t.colors.$danger500,
        borderRadius: t.radii.$circle,
      })}
    >
      <Icon
        icon={Eye}
        sx={{
          width,
          height,
          transform: 'translateY(3.5px)',
        }}
      />
    </Flex>
  );
};

type FabContentProps = { id: string; paddingLeft: string; paddingRight: string };

const FabContent: React.FC<FabContentProps> = ({ id, paddingLeft, paddingRight }) => {
  const { signOut } = useCoreClerk();

  return (
    <Col
      id='impersonationText'
      sx={{
        whiteSpace: 'nowrap',
        maxWidth: '0px',
        transition: `max-width 800ms`,
      }}
    >
      <Col
        sx={{
          paddingLeft,
          paddingRight,
        }}
      >
        <Text
          colorScheme='neutral'
          variant='regularMedium'
        >
          Signed in as {id}
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
            close();
          }}
        >
          Sign out and close tab
        </Link>
      </Col>
    </Col>
  );
};

export const ImpersonationFab: React.FC = () => {
  const session = useCoreSession();
  const { parsedInternalTheme } = useAppearance();
  const actor = session?.actor;

  //essentials for calcs
  const eyePadding = '20px';
  const eyeWidth = '24px';
  const eyeHeight = '24px';
  const textPaddingLeft = parsedInternalTheme.sizes.$5;
  const textPaddingRight = parsedInternalTheme.sizes.$8;

  return (
    <>
      {actor && (
        <Portal>
          <Flex
            align='center'
            sx={t => ({
              position: 'fixed',
              height: `calc(${eyeWidth} + 2 * ${eyePadding})`,
              width: 'auto',
              overflow: 'hidden',
              top: '109px',
              right: '23px',
              zIndex: 999999,
              boxShadow: t.shadows.$boxShadow2,
              borderRadius: '32px',
              backgroundColor: t.colors.$white,
              fontFamily: t.fonts.$main,
              ':hover #impersonationText': {
                maxWidth: `min(100vw - ${eyeWidth} - ${eyePadding}
                 - ${textPaddingLeft} - ${textPaddingRight} , 45ch)`,
              },
              ':hover #impersonationEye': {
                transform: 'rotate(-180deg)',
              },
            })}
          >
            <EyeCircle
              width={eyeWidth}
              height={eyeHeight}
              padding={eyePadding}
            />
            <FabContent
              id={actor.sub}
              paddingLeft={textPaddingLeft}
              paddingRight={textPaddingRight}
            />
          </Flex>
        </Portal>
      )}
    </>
  );
};

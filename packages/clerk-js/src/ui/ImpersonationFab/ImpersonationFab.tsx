import React from 'react';

import { mqu } from '../../ui/styledSystem';
import { getFullName, getIdentifier } from '../../ui/utils';
import { useCoreClerk, useCoreSession } from '../contexts';
import {
  Col,
  descriptors,
  Flex,
  Icon,
  Link,
  LocalizationKey,
  localizationKeys,
  Text,
  useAppearance,
  useLocalizations,
} from '../customizables';
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
      elementDescriptor={descriptors.impersonationFabIconContainer}
      center
      sx={t => ({
        width,
        height,
        transition: `transform ${t.transitionDuration.$slowest} ease`,
        backgroundColor: t.colors.$danger500,
        borderRadius: t.radii.$circle,
      })}
    >
      <Icon
        elementDescriptor={descriptors.impersonationFabIcon}
        icon={Eye}
        size={undefined}
      />
    </Col>
  );
};

type FabContentProps = { title: LocalizationKey; signOutText: LocalizationKey };

const FabContent = ({ title, signOutText }: FabContentProps) => {
  const { signOut } = useCoreClerk();

  return (
    <Col
      sx={t => ({
        width: '100%',
        paddingLeft: t.sizes.$4,
        paddingRight: t.sizes.$6,
        whiteSpace: 'nowrap',
      })}
    >
      <Text
        colorScheme='neutral'
        elementDescriptor={descriptors.impersonationFabTitle}
        variant='regularMedium'
        truncate
        localizationKey={title}
      />
      <Link
        variant='regularMedium'
        elementDescriptor={descriptors.impersonationFabActionLink}
        sx={t => ({
          alignSelf: 'flex-start',
          color: t.colors.$primary500,
          ':hover': {
            cursor: 'pointer',
          },
        })}
        localizationKey={signOutText}
        onClick={async () => {
          await signOut();
        }}
      />
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

  const title = localizationKeys('impersonationFab.title', {
    identifier: getFullName(session.user) || getIdentifier(session.user),
  });
  const titleLength = useLocalizations().t(title).length;

  return (
    <Portal>
      <Flex
        elementDescriptor={descriptors.impersonationFab}
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
            maxWidth: `min(calc(50vw - ${eyeWidth} - 2 * ${right}), ${titleLength}ch)`,
            [mqu.md]: {
              maxWidth: `min(calc(100vw - ${eyeWidth} - 2 * ${right}), ${titleLength}ch)`,
            },
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
            transition: `max-width ${t.transitionDuration.$slowest} ease`,
          })}
        >
          <FabContent
            title={title}
            signOutText={localizationKeys('impersonationFab.action__signOut')}
          />
        </Flex>
      </Flex>
    </Portal>
  );
};

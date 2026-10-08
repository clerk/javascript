import type { PointerEventHandler, RefObject } from 'react';

import type { LocalizationKey } from '../../customizables';
import {
  Col,
  descriptors,
  Flex,
  Icon,
  Link,
  localizationKeys,
  Text,
  useAppearance,
  useLocalizations,
} from '../../customizables';
import { Portal } from '../../elements/Portal';
import { Eye } from '../../icons';
import type { PropsOfComponent } from '../../styledSystem';
import { mqu } from '../../styledSystem';
import { defaultRight, defaultTop, rightProperty, topProperty } from './impersonation-fab.constants';

type EyeCircleProps = PropsOfComponent<typeof Col> & {
  width: string;
  height: string;
};

const EyeCircle = ({ width, height, ...props }: EyeCircleProps) => {
  const { sx, ...rest } = props;
  return (
    <Col
      elementDescriptor={descriptors.impersonationFabIconContainer}
      center
      sx={[
        t => ({
          width,
          height,
          backgroundColor: t.colors.$danger500,
          borderRadius: t.radii.$circle,
        }),
        sx,
      ]}
      {...rest}
    >
      <Icon
        elementDescriptor={descriptors.impersonationFabIcon}
        icon={Eye}
        sx={t => ({ color: t.colors.$white })}
        size='lg'
      />
    </Col>
  );
};

type FabContentProps = {
  title: LocalizationKey;
  signOutText: LocalizationKey;
  onSignOut: () => void;
};

function FabContent({ title, signOutText, onSignOut }: FabContentProps) {
  return (
    <Col
      sx={t => ({
        width: '100%',
        paddingInlineStart: t.sizes.$4,
        paddingInlineEnd: t.sizes.$6,
        whiteSpace: 'nowrap',
      })}
    >
      <Text
        colorScheme='secondary'
        elementDescriptor={descriptors.impersonationFabTitle}
        variant='buttonLarge'
        truncate
        localizationKey={title}
      />
      <Link
        variant='buttonLarge'
        elementDescriptor={descriptors.impersonationFabActionLink}
        sx={t => ({
          alignSelf: 'flex-start',
          color: t.colors.$primary500,
          ':hover': { cursor: 'pointer' },
        })}
        localizationKey={signOutText}
        onClick={onSignOut}
      />
    </Col>
  );
}

export type ImpersonationFabViewProps = {
  identifier: string;
  onSignOut: () => void;
  containerRef: RefObject<HTMLDivElement>;
  onPointerDown: PointerEventHandler;
};

export function ImpersonationFabView({
  identifier,
  onSignOut,
  containerRef,
  onPointerDown,
}: ImpersonationFabViewProps) {
  const { t } = useLocalizations();
  const { parsedInternalTheme } = useAppearance();
  const eyeWidth = parsedInternalTheme.sizes.$16;
  const eyeHeight = eyeWidth;
  const title = localizationKeys('impersonationFab.title', { identifier });
  const titleLength = t(title).length;
  const horizontalPosition = 'right';

  return (
    <Portal>
      <Flex
        ref={containerRef}
        elementDescriptor={descriptors.impersonationFab}
        onPointerDown={onPointerDown}
        align='center'
        sx={t => ({
          touchAction: 'none',
          position: 'fixed',
          overflow: 'hidden',
          top: `var(${topProperty}, ${defaultTop}px)`,
          [horizontalPosition]: `var(${rightProperty}, ${defaultRight}px)`,
          zIndex: t.zIndices.$fab,
          boxShadow: t.shadows.$fabShadow,
          borderRadius: t.radii.$halfHeight,
          backgroundColor: t.colors.$white,
          fontFamily: t.fonts.$main,
          ':hover': { cursor: 'grab' },
          ':hover #cl-impersonationText': {
            transition: `max-width ${t.transitionDuration.$slowest} ease, opacity ${t.transitionDuration.$slower} ease ${t.transitionDuration.$slowest}`,
            maxWidth: `min(calc(50vw - ${eyeWidth} - 2 * ${defaultRight}px), ${titleLength}ch)`,
            [mqu.md]: {
              maxWidth: `min(calc(100vw - ${eyeWidth} - 2 * ${defaultRight}px), ${titleLength}ch)`,
            },
            opacity: 1,
          },
          ':hover #cl-impersonationEye': { transform: 'rotate(-180deg)' },
        })}
      >
        <EyeCircle
          id='cl-impersonationEye'
          width={eyeWidth}
          height={eyeHeight}
          sx={t => ({ transition: `transform ${t.transitionDuration.$slowest} ease` })}
        />
        <Flex
          id='cl-impersonationText'
          sx={t => ({
            transition: `max-width ${t.transitionDuration.$slowest} ease, opacity ${t.transitionDuration.$fast} ease`,
            maxWidth: '0px',
            opacity: 0,
          })}
        >
          <FabContent
            title={title}
            signOutText={localizationKeys('impersonationFab.action__signOut')}
            onSignOut={onSignOut}
          />
        </Flex>
      </Flex>
    </Portal>
  );
}

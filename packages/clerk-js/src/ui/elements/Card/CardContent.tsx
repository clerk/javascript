import React from 'react';

import { descriptors, Flex, generateFlowPartClassname, Icon, useAppearance } from '../../customizables';
import { Close } from '../../icons';
import { type PropsOfComponent } from '../../styledSystem';
import { ApplicationLogo } from '..';
import { useFlowMetadata } from '../contexts';
import { IconButton } from '../IconButton';
import { useUnsafeModalContext } from '../Modal';

type CardContentProps = PropsOfComponent<typeof Flex>;
export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>((props, ref) => {
  const { children, sx, gap = 8, ...rest } = props;
  const flowMetadata = useFlowMetadata();
  const appearance = useAppearance();
  const { toggle } = useUnsafeModalContext();

  return (
    <Flex
      direction='col'
      className={generateFlowPartClassname(flowMetadata)}
      elementDescriptor={descriptors.card}
      sx={[
        t => ({
          backgroundColor: t.colors.$colorBackground,
          transitionProperty: t.transitionProperty.$common,
          transitionDuration: '200ms',
          textAlign: 'center',
          zIndex: t.zIndices.$card,
          boxShadow: t.shadows.$cardContentShadow,
          borderRadius: t.radii.$lg,
          position: 'relative',
          padding: t.space.$8,
          justifyContent: 'center',
          alignContent: 'center',
        }),
        sx,
      ]}
      gap={gap}
      ref={ref}
      {...rest}
    >
      {appearance.parsedLayout.logoPlacement === 'inside' && <ApplicationLogo />}
      {toggle && (
        <IconButton
          elementDescriptor={descriptors.modalCloseButton}
          variant='ghost'
          aria-label='Close modal'
          onClick={toggle}
          icon={
            <Icon
              icon={Close}
              size='xs'
            />
          }
          sx={t => ({
            color: t.colors.$colorTextTertiary,
            zIndex: t.zIndices.$modal,
            position: 'absolute',
            top: t.space.$none,
            right: t.space.$none,
            padding: t.space.$3,
          })}
        />
      )}
      {children}
    </Flex>
  );
});

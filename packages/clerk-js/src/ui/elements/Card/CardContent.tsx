import React from 'react';

import { descriptors, Flex, generateFlowPartClassname, Icon } from '../../customizables';
import { shadows } from '../../foundations/shadows';
import { Close } from '../../icons';
import type { PropsOfComponent } from '../../styledSystem';
import { useFlowMetadata } from '../contexts';
import { IconButton } from '../IconButton';
import { useUnsafeModalContext } from '../Modal';

type CardContentProps = PropsOfComponent<typeof Flex>;
export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>((props, ref) => {
  const { children, sx, ...rest } = props;
  const flowMetadata = useFlowMetadata();
  const { toggle } = useUnsafeModalContext();

  return (
    <Flex
      direction='col'
      className={generateFlowPartClassname(flowMetadata)}
      {...rest}
      elementDescriptor={descriptors.cardContent}
      sx={[
        t => ({
          backgroundColor: t.colors.$colorBackground,
          overflow: 'hidden',
          willChange: 'transform, opacity, height',
          transitionProperty: t.transitionProperty.$common,
          transitionDuration: '200ms',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          zIndex: t.zIndices.$card,
          boxShadow: shadows.cardContentShadow,
          borderRadius: `${t.radii.$card} ${t.radii.$card} ${t.radii.$lg} ${t.radii.$lg}`,
          position: 'relative',
          padding: t.space.$8,
          gap: t.space.$8,
        }),
        sx,
      ]}
      ref={ref}
    >
      {toggle && (
        <IconButton
          elementDescriptor={descriptors.modalCloseButton}
          variant='ghost'
          aria-label='Close modal'
          onClick={toggle}
          icon={
            <Icon
              icon={Close}
              size='sm'
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

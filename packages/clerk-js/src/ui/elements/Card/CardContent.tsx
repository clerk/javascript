import React from 'react';

import { descriptors, Flex, generateFlowPartClassname, Icon } from '../../customizables';
import { Close } from '../../icons';
import { type PropsOfComponent } from '../../styledSystem';
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
      elementDescriptor={descriptors.card}
      sx={[
        t => ({
          backgroundColor: t.colors.$colorBackground,
          transitionProperty: t.transitionProperty.$common,
          transitionDuration: '200ms',
          textAlign: 'center',
          zIndex: t.zIndices.$card,
          border: `${t.borders.$normal} ${t.colors.$neutralAlpha50}`,
          boxShadow: t.shadows.$cardContentShadow,
          borderTopLeftRadius: t.radii.$xl,
          borderTopRightRadius: t.radii.$xl,
          borderBottomLeftRadius: t.radii.$lg,
          borderBottomRightRadius: t.radii.$lg,
          position: 'relative',
          padding: `${t.space.$8} ${t.space.$10}`,
          justifyContent: 'center',
          alignContent: 'center',
        }),
        sx,
      ]}
      gap={8}
      ref={ref}
      {...rest}
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
              size='xs'
            />
          }
          sx={t => ({
            color: t.colors.$colorTextSecondary,
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

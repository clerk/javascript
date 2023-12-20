import React from 'react';

import { Box, descriptors, Icon } from '../../customizables';
import { Close } from '../../icons';
import type { PropsOfComponent } from '../../styledSystem';
import { mqu } from '../../styledSystem';
import { IconButton, useUnsafeModalContext } from '..';
import { Card } from '../Card';

export const ProfileCardRoot = React.forwardRef<HTMLDivElement, PropsOfComponent<typeof Card.Root>>((props, ref) => {
  const { sx, children, ...rest } = props;
  const { toggle } = useUnsafeModalContext();

  return (
    <Card.Root
      ref={ref}
      sx={[
        t => ({
          width: t.sizes.$220,
          maxWidth: `calc(100vw - ${t.sizes.$20})`,
          display: 'grid',
          [mqu.md]: {
            display: 'flex',
          },
          gridTemplateColumns: '1fr 2.5fr',
          overflow: 'hidden',
          height: t.sizes.$176,
          position: 'relative',
        }),
        sx,
      ]}
      {...rest}
    >
      {toggle && (
        <Box
          sx={t => ({
            [mqu.md]: {
              padding: `${t.space.$1x5} ${t.space.$2}`,
            },
            zIndex: t.zIndices.$modal,
            position: 'absolute',
            top: t.space.$none,
            right: t.space.$none,
          })}
        >
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
              padding: t.space.$3,
            })}
          />
        </Box>
      )}
      {children}
      <Card.Footer
        sx={{
          display: 'none',
          [mqu.md]: {
            display: 'flex',
          },
        }}
      />
    </Card.Root>
  );
});

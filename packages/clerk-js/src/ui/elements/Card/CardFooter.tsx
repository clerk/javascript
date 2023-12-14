import React from 'react';

import { descriptors, Flex } from '../../customizables';
import type { PropsOfComponent } from '../../styledSystem';
import { PoweredByClerkTag } from '..';

type CardFooterItemProps = PropsOfComponent<typeof Flex>;
const CardFooterItem = React.forwardRef<HTMLDivElement, CardFooterItemProps>((props, ref) => {
  const { sx, ...rest } = props;

  return (
    <Flex
      align='center'
      justify='center'
      elementDescriptor={descriptors.cardFooterItem}
      sx={[
        sx,
        {
          position: 'relative',
          width: '100%',
        },
      ]}
      {...rest}
      ref={ref}
    />
  );
});

type CardFooterProps = PropsOfComponent<typeof Flex>;
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>((props, ref) => {
  const { children, sx, ...rest } = props;
  return (
    <Flex
      direction='col'
      align='center'
      justify='center'
      elementDescriptor={descriptors.cardFooter}
      sx={[
        t => ({
          '>:first-of-type': {
            padding: `${t.space.$6} ${t.space.$2} ${t.space.$4} ${t.space.$2}`,
            marginTop: `-${t.space.$2}`,
          },
          '>:not(:first-of-type)': {
            padding: `${t.space.$4} ${t.space.$2}`,
            borderTop: t.borders.$normal,
            borderColor: t.colors.$blackAlpha100,
          },
        }),
        sx,
      ]}
      {...rest}
      ref={ref}
    >
      {children}
      <CardFooterItem>
        <PoweredByClerkTag />
      </CardFooterItem>
    </Flex>
  );
});

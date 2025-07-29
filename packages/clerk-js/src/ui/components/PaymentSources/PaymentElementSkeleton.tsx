import type { PropsWithChildren } from 'react';

import { Box, Flex, Grid } from '@/ui/customizables';

const SkeletonLine = (props: Parameters<typeof Box>[0]) => {
  return (
    <Box
      sx={[
        t => ({
          height: t.space.$2,
          width: '100%',
          borderRadius: t.radii.$md,
          background: t.colors.$neutralAlpha100,
        }),
        props.sx,
      ]}
    />
  );
};

const SkeletonInput = () => {
  return (
    <SkeletonLine
      sx={t => ({
        height: t.space.$10,
        width: '100%',
      })}
    />
  );
};

const LineGroup = (props: PropsWithChildren) => {
  return (
    <Flex
      direction='col'
      gap={2}
    >
      {props.children}
    </Flex>
  );
};

const PaymentElementSkeleton = () => {
  return (
    <Box
      aria-label='Loading...'
      sx={{
        position: 'relative',
        minHeight: 0,
        flex: 1,
        overflowY: 'auto',
      }}
    >
      <Flex
        direction='col'
        gap={5}
      >
        <LineGroup>
          <SkeletonLine
            sx={t => ({
              height: t.space.$3,
              width: t.sizes.$24,
            })}
          />
          <SkeletonInput />
        </LineGroup>

        <Grid
          columns={2}
          gap={4}
        >
          <LineGroup>
            <SkeletonLine
              sx={t => ({
                height: t.space.$3,
                width: t.sizes.$20,
              })}
            />

            <SkeletonInput />
          </LineGroup>
          <LineGroup>
            <SkeletonLine
              sx={t => ({
                height: t.space.$3,
                width: t.sizes.$24,
              })}
            />

            <SkeletonInput />
          </LineGroup>
        </Grid>

        <LineGroup>
          <SkeletonLine
            sx={t => ({
              height: t.space.$3,
              width: t.sizes.$16,
            })}
          />

          <SkeletonInput />
        </LineGroup>

        <LineGroup>
          <SkeletonLine />
          <SkeletonLine />
          <SkeletonLine sx={{ width: '66.666667%' }} />
        </LineGroup>
      </Flex>
    </Box>
  );
};

export { PaymentElementSkeleton };

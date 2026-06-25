import { Box } from './box';
import { Skeleton } from './skeleton';

/**
 * Loading placeholder mirroring the org-profile section frame: a heading + description
 * on the left and an action button on the right. Used by the Leave/Delete sections
 * while `useOrganization()` is unloaded, so the layout doesn't shift when content lands.
 */
export function SectionSkeleton() {
  return (
    <Box
      sx={() => ({
        width: '100%',
        containerType: 'inline-size',
      })}
    >
      <Box
        sx={t => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          columnGap: t.spacing(10),
          rowGap: t.spacing(4),
          '@container (min-width: 600px)': {
            flexDirection: 'row',
          },
        })}
      >
        <Box
          sx={t => ({
            display: 'flex',
            flexDirection: 'column',
            gap: t.spacing(2),
            flexGrow: 1,
          })}
        >
          <Skeleton
            width={160}
            height='1.25rem'
          />
          <Skeleton
            width='min(280px, 100%)'
            height='1rem'
          />
        </Box>
        <Skeleton
          width={150}
          height='2.25rem'
          sx={() => ({ flexShrink: 0 })}
        />
      </Box>
    </Box>
  );
}

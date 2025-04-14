import { Badge, Box, Button, Dd, Dl, Dt, Heading, Text } from '../../customizables';
import { LineItems } from '../../elements';
import { common } from '../../styledSystem';
import { colors } from '../../utils';

export const InvoicePage = () => {
  return (
    <Box
      sx={t => ({
        display: 'flex',
        flexDirection: 'column',
        gap: t.space.$4,
      })}
    >
      <Box
        sx={t => ({
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$neutralAlpha100,
          borderRadius: t.radii.$lg,
          overflow: 'hidden',
        })}
      >
        <Box
          as='header'
          sx={t => ({
            padding: t.space.$4,
            background: common.mergedColorsBackground(
              colors.setAlpha(t.colors.$colorBackground, 1),
              t.colors.$neutralAlpha50,
            ),
            borderBlockEndWidth: t.borderWidths.$normal,
            borderBlockEndStyle: t.borderStyles.$solid,
            borderBlockEndColor: t.colors.$neutralAlpha100,
          })}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Heading textVariant='h2'>INV-2025643782</Heading>
            <Badge colorScheme='warning'>Failed</Badge>
          </Box>
          <Dl
            sx={t => ({
              display: 'flex',
              justifyContent: 'space-between',
              marginBlockStart: t.space.$3,
            })}
          >
            <Box>
              <Dt>
                <Text
                  colorScheme='secondary'
                  variant='body'
                >
                  Created on
                </Text>
              </Dt>
              <Dd>
                <Text variant='subtitle'>{new Date('2025-04-14T15:21:49-0400').toLocaleDateString()}</Text>
              </Dd>
            </Box>
            <Box
              sx={{
                textAlign: 'right',
              }}
            >
              <Dt>
                <Text
                  colorScheme='secondary'
                  variant='body'
                >
                  Due on
                </Text>
              </Dt>
              <Dd>
                <Text variant='subtitle'>{new Date('2025-04-14T15:21:49-0400').toLocaleDateString()}</Text>
              </Dd>
            </Box>
          </Dl>
        </Box>
        <Box
          sx={t => ({
            padding: t.space.$4,
          })}
        >
          <LineItems.Root>
            <LineItems.Group>
              <LineItems.Title title='Platnum plan' />
              <LineItems.Description
                text='$400.00'
                suffix='per month'
              />
            </LineItems.Group>
            <LineItems.Group
              variant='secondary'
              borderTop
            >
              <LineItems.Title title='Subtotal' />
              <LineItems.Description text='$400.00' />
            </LineItems.Group>
            <LineItems.Group variant='secondary'>
              <LineItems.Title title='Tax' />
              <LineItems.Description text='$5.00' />
            </LineItems.Group>
            <LineItems.Group borderTop>
              <LineItems.Title title='Total due' />
              <LineItems.Description
                text='$405.00'
                prefix='USD'
              />
            </LineItems.Group>
          </LineItems.Root>
        </Box>
      </Box>

      <Box
        sx={t => ({
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$neutralAlpha100,
          borderRadius: t.radii.$lg,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          overflow: 'hidden',
          padding: t.space.$4,
        })}
      >
        <Box>
          <Text variant='subtitle'>Next Billing Attempt</Text>
          <Text
            variant='body'
            colorScheme='secondary'
            sx={t => ({
              marginBlockStart: t.space.$0x5,
            })}
          >
            in 2 days &bull; 10 Jan, 2025
          </Text>
        </Box>
        <Button>Pay now</Button>
      </Box>
    </Box>
  );
};

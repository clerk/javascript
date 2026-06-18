import { ArrowLeftRight, Plus } from '../../icons';
import { Box } from '../components/box';
import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Tabs } from '../components/tabs';
import { Text } from '../components/text';

export function OrganizationProfileBilling() {
  return (
    <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(4), width: '100%' })}>
      <Heading size='xl'>Billing</Heading>

      <Tabs.Root defaultValue='subscription'>
        <Tabs.List>
          <Tabs.Tab value='subscription'>Subscription</Tabs.Tab>
          <Tabs.Tab value='statements'>Statements</Tabs.Tab>
          <Tabs.Tab value='payments'>Payments</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>

        <Tabs.Panel value='subscription'>
          <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(6) })}>
            {/* Plan */}
            <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2.5) })}>
              <Box
                sx={t => ({
                  display: 'flex',
                  alignItems: 'center',
                  paddingInline: t.spacing(3),
                  paddingRight: t.spacing(1),
                })}
              >
                <Heading
                  size='sm'
                  sx={() => ({ flex: 1 })}
                >
                  Plan
                </Heading>
                <Button
                  variant='ghost'
                  intent='primary'
                  size='md'
                  sx={t => ({ gap: t.spacing(1) })}
                >
                  Switch plans
                  <ArrowLeftRight
                    width={14}
                    height={14}
                  />
                </Button>
              </Box>
              <Box
                sx={t => ({
                  border: `1px solid ${t.color.border}`,
                  borderRadius: '8px',
                  padding: t.spacing(3),
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing(2),
                  background: `light-dark(white, oklch(0.145 0 0))`,
                })}
              >
                <Text
                  size='sm'
                  sx={t => ({ flex: 1, fontWeight: t.font.medium })}
                >
                  Platinum
                </Text>
                <Box sx={t => ({ display: 'flex', alignItems: 'baseline', gap: t.spacing(0.5) })}>
                  <Text
                    size='sm'
                    sx={t => ({ fontWeight: t.font.medium })}
                  >
                    $99.00
                  </Text>
                  <Text
                    size='sm'
                    intent='mutedForeground'
                    render={p => <span {...p} />}
                  >
                    /mo
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Payment methods */}
            <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2.5) })}>
              <Box
                sx={t => ({
                  display: 'flex',
                  alignItems: 'center',
                  paddingInline: t.spacing(3),
                  paddingRight: t.spacing(1),
                })}
              >
                <Heading
                  size='sm'
                  sx={() => ({ flex: 1 })}
                >
                  Payment methods
                </Heading>
                <Button
                  variant='ghost'
                  intent='primary'
                  size='md'
                  sx={t => ({ gap: t.spacing(1) })}
                >
                  Add
                  <Plus
                    width={12}
                    height={12}
                  />
                </Button>
              </Box>
              <Box
                sx={t => ({
                  border: `1px solid ${t.color.border}`,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: `light-dark(white, oklch(0.145 0 0))`,
                })}
              >
                <Box
                  sx={t => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing(2),
                    padding: t.spacing(3),
                  })}
                >
                  <Text
                    size='sm'
                    sx={t => ({ fontWeight: t.font.medium })}
                  >
                    Visa
                  </Text>
                  <Text
                    size='sm'
                    intent='mutedForeground'
                    render={p => <span {...p} />}
                  >
                    ···· 4252
                  </Text>
                  <Box
                    sx={t => ({
                      display: 'inline-flex',
                      alignItems: 'center',
                      height: '18px',
                      paddingInline: t.spacing(1.5),
                      borderRadius: t.rounded.md,
                      border: `1px solid ${t.color.border}`,
                      ...t.text('xs'),
                      color: t.color.mutedForeground,
                    })}
                  >
                    Default
                  </Box>
                </Box>
                <Box sx={t => ({ height: '1px', background: t.color.border, marginInline: t.spacing(3) })} />
                <Box
                  sx={t => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing(2),
                    padding: t.spacing(3),
                  })}
                >
                  <Text
                    size='sm'
                    sx={t => ({ fontWeight: t.font.medium })}
                  >
                    Amex
                  </Text>
                  <Text
                    size='sm'
                    intent='mutedForeground'
                    render={p => <span {...p} />}
                  >
                    ···· 0080
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value='statements'>
          <Text
            size='sm'
            intent='mutedForeground'
          >
            No statements yet.
          </Text>
        </Tabs.Panel>

        <Tabs.Panel value='payments'>
          <Text
            size='sm'
            intent='mutedForeground'
          >
            No payments yet.
          </Text>
        </Tabs.Panel>
      </Tabs.Root>
    </Box>
  );
}

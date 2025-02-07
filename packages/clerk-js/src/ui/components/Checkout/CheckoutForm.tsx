import type { CommerceCheckoutResource } from '@clerk/types';
import { useCallback, useEffect, useState } from 'react';

import { Box, Button, Col, Flex, Form, Icon, Text } from '../../customizables';
import { ArrowUpDown, ChevronDown, CreditCard } from '../../icons';

export const CheckoutForm = ({ checkout }: { checkout?: CommerceCheckoutResource }) => {
  console.log(checkout);
  const [openAccountFundsDropDown, setOpenAccountFundsDropDown] = useState(true);
  const [openAddNewSourceDropDown, setOpenAddNewSourceDropDown] = useState(true);

  const didExpandStripePaymentMethods = useCallback(() => {
    setOpenAccountFundsDropDown(false);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <Form
      onSubmit={onSubmit}
      sx={t => ({
        padding: t.space.$4,
      })}
    >
      <Col gap={3}>
        <Dropdown
          open={openAccountFundsDropDown}
          setOpen={setOpenAccountFundsDropDown}
          title='Account Funds'
        >
          <Col gap={3}>
            <Flex
              gap={2}
              align='center'
              sx={t => ({
                backgroundColor: t.colors.$colorBackground,
                padding: t.space.$2,
                borderRadius: t.radii.$lg,
                borderWidth: t.borderWidths.$normal,
                borderStyle: t.borderStyles.$solid,
                borderColor: t.colors.$neutralAlpha100,
                cursor: 'pointer',
              })}
            >
              <Icon
                icon={CreditCard}
                size='md'
              />
              <Text variant='buttonLarge'>Visa ⋯ 4242</Text>
              <Icon
                icon={ArrowUpDown}
                size='md'
                colorScheme='neutral'
                sx={{
                  marginLeft: 'auto',
                }}
              />
            </Flex>
            <Button
              colorScheme='primary'
              size='sm'
              textVariant={'buttonLarge'}
              sx={{
                width: '100%',
              }}
            >
              Pay $10.99
            </Button>
          </Col>
        </Dropdown>
        <Text
          variant='buttonSmall'
          colorScheme='secondary'
          sx={{ textAlign: 'center' }}
        >
          OR
        </Text>
        <Dropdown
          open={openAddNewSourceDropDown}
          setOpen={setOpenAddNewSourceDropDown}
          title='Add a New Payment Source'
        >
          <StripePaymentMethods onExpand={didExpandStripePaymentMethods} />
        </Dropdown>
      </Col>
    </Form>
  );
};

const StripePaymentMethods = ({ onExpand }: { onExpand: () => void }) => {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (!collapsed) {
      onExpand();
    }
  }, [collapsed, onExpand]);

  return (
    <Col gap={3}>
      <Button
        variant='unstyled'
        size='md'
        textVariant={'buttonLarge'}
        sx={{
          width: '100%',
          backgroundColor: '#FFC43A',
          color: '#222D65',
        }}
      >
        Pay with PayPal
      </Button>
      {collapsed ? (
        <>
          <Button
            variant='unstyled'
            size='md'
            textVariant={'buttonLarge'}
            sx={{
              width: '100%',
              backgroundColor: 'black',
              color: 'white',
            }}
          >
            Pay with ApplePay
          </Button>
          <Button
            variant='unstyled'
            size='md'
            textVariant={'buttonLarge'}
            sx={{
              width: '100%',
              backgroundColor: 'black',
              color: 'white',
            }}
          >
            Pay with GPay
          </Button>
          <Button
            colorScheme='light'
            size='md'
            textVariant={'buttonLarge'}
            sx={{
              width: '100%',
            }}
            onClick={() => setCollapsed(false)}
          >
            More Payment Methods
          </Button>
        </>
      ) : (
        <>[COMING SOON]</>
      )}
    </Col>
  );
};

const Dropdown = ({
  open,
  setOpen,
  title,
  children,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Col
      sx={t => ({
        borderRadius: t.radii.$lg,
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$neutralAlpha100,
      })}
    >
      <button
        type='button'
        onClick={() => setOpen(!open)}
      >
        <Flex
          gap={2}
          align='center'
          justify='between'
          sx={t => ({
            paddingInline: t.space.$3,
            height: t.sizes.$10,
          })}
        >
          <Text variant='buttonSmall'>{title}</Text>
          <Icon
            icon={ChevronDown}
            colorScheme='neutral'
            size='md'
            sx={{ rotate: open ? '180deg' : '0', transformOrigin: '50%' }}
          />
        </Flex>
      </button>

      {open && (
        <Box
          sx={t => ({
            padding: t.space.$3,
            backgroundColor: t.colors.$neutralAlpha25,
            borderRadius: t.radii.$lg,
            borderTopWidth: t.borderWidths.$normal,
            borderStyle: t.borderStyles.$solid,
            borderColor: t.colors.$neutralAlpha100,
          })}
        >
          {children}
        </Box>
      )}
    </Col>
  );
};

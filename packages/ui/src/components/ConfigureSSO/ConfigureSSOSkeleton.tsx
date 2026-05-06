import { Box, Button, descriptors, Flex, Icon, Spinner } from '@/customizables';
import { CaretLeft, CaretRight } from '@/icons';
import { common } from '@/styledSystem';

export const ConfigureSSOSkeleton = () => {
  return (
    <>
      <Flex
        align='center'
        sx={theme => ({
          gap: theme.space.$2,
          padding: `${theme.space.$4} ${theme.space.$6}`,
        })}
      >
        <BreadcrumbItemSkeleton />
        <BreadcrumItemIconSkeleton />

        <BreadcrumbItemSkeleton />
        <BreadcrumItemIconSkeleton />

        <BreadcrumbItemSkeleton />
        <BreadcrumItemIconSkeleton />

        <BreadcrumbItemSkeleton />
      </Flex>

      <Flex
        align='center'
        justify='center'
        sx={theme => ({
          flex: 1,
          borderTopWidth: theme.borderWidths.$normal,
          borderTopColor: theme.colors.$borderAlpha150,
        })}
      >
        <Spinner
          size='xs'
          colorScheme='neutral'
          elementDescriptor={descriptors.spinner}
        />
      </Flex>

      <Flex
        elementDescriptor={descriptors.footer}
        align='center'
        justify='end'
        sx={theme => ({
          gap: theme.space.$2,
          padding: `${theme.space.$4}`,
          background: common.mutedBackground(theme),
          borderTopWidth: theme.borderWidths.$normal,
          borderTopStyle: theme.borderStyles.$solid,
          borderTopColor: theme.colors.$borderAlpha100,
        })}
      >
        <Button
          elementDescriptor={descriptors.configureSSOWizardFooterPreviousButton}
          variant='outline'
          size='sm'
          isDisabled
        >
          <Icon
            icon={CaretLeft}
            size='sm'
            sx={theme => ({ marginInlineEnd: theme.space.$1 })}
          />
          Previous
        </Button>

        <Button
          elementDescriptor={descriptors.configureSSOWizardFooterContinueButton}
          variant='solid'
          size='sm'
          isDisabled
        >
          Continue
          <Icon
            icon={CaretRight}
            size='sm'
            sx={theme => ({ marginInlineStart: theme.space.$1 })}
          />
        </Button>
      </Flex>
    </>
  );
};

const BreadcrumbItemSkeleton = (): JSX.Element => (
  <Flex
    align='center'
    sx={t => ({ gap: t.space.$1x5 })}
  >
    <Box
      sx={t => ({
        width: t.sizes.$4,
        height: t.sizes.$4,
        borderRadius: t.radii.$circle,
        backgroundColor: t.colors.$neutralAlpha100,
      })}
    />
    <Box
      sx={t => ({
        width: t.sizes.$17,
        height: '5px',
        borderRadius: t.radii.$md,
        backgroundColor: t.colors.$neutralAlpha100,
      })}
    />
  </Flex>
);

const BreadcrumItemIconSkeleton = (): JSX.Element => {
  return (
    <Icon
      icon={CaretRight}
      size='md'
      sx={theme => ({ color: theme.colors.$neutralAlpha100 })}
    />
  );
};

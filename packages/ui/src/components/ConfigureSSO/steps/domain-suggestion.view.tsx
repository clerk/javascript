import { Button, descriptors, Flex, Icon, localizationKeys, Text } from '@/customizables';
import { Close } from '@/icons';

type DomainSuggestionViewProps = {
  domain: string;
  isSubmitting: boolean;
  handleAdd: () => void;
  dismiss: () => void;
};

export const DomainSuggestionView = ({
  domain,
  isSubmitting,
  handleAdd,
  dismiss,
}: DomainSuggestionViewProps): JSX.Element => {
  return (
    <Flex
      elementDescriptor={descriptors.configureSSOVerifyDomainSuggestion}
      align='center'
      justify='between'
      sx={t => ({
        gap: t.space.$2,
        paddingInline: t.space.$3,
        paddingBlock: t.space.$1x5,
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$borderAlpha150,
        borderRadius: t.radii.$lg,
        background: t.colors.$neutralAlpha50,
      })}
    >
      <Flex
        align='center'
        sx={t => ({ gap: t.space.$3, minWidth: 0 })}
      >
        <Text
          as='span'
          colorScheme='secondary'
          localizationKey={localizationKeys('configureSSO.organizationDomainsStep.domainSuggestion.messageLabel', {
            domain,
          })}
          sx={t => ({ fontSize: t.fontSizes.$sm })}
        />

        <Button
          variant='bordered'
          colorScheme='secondary'
          size='xs'
          isLoading={isSubmitting}
          onClick={handleAdd}
          localizationKey={localizationKeys(
            'configureSSO.organizationDomainsStep.domainSuggestion.formButtonPrimary__add',
            { domain },
          )}
          sx={{ flexShrink: 0 }}
        />
      </Flex>

      <Button
        variant='ghost'
        colorScheme='neutral'
        aria-label='Dismiss domain suggestion'
        isDisabled={isSubmitting}
        onClick={dismiss}
        sx={t => ({ flexShrink: 0, padding: t.space.$1 })}
      >
        <Icon
          icon={Close}
          sx={t => ({ width: t.sizes.$4, height: t.sizes.$4, color: t.colors.$colorMutedForeground })}
        />
      </Button>
    </Flex>
  );
};

import {
  Badge,
  Box,
  Button,
  CheckboxInput,
  Col,
  descriptors,
  Flex,
  Icon,
  localizationKeys,
  Spinner,
  Text,
  useLocalizations,
} from '@/customizables';
import { Animated } from '@/elements/Animated';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { Tooltip } from '@/elements/Tooltip';
import { Checkmark, Clipboard, Close } from '@/icons';

import type { SSODomainVerification } from '../configure-sso.types';
import { ExpiredNotice } from './ExpiredNotice';

export const DomainCardView = ({
  domainName,
  ownershipVerification,
  isVerified,
  isExpired,
  cardId,
  isSelectable,
  isSelected,
  claimedBy,
  onToggle,
  isToggleDisabled = false,
  onRemove,
  onPrepareOwnershipVerification,
  isRemoveDisabled = false,
  removeDisabledTooltip,
}: {
  domainName: string;
  ownershipVerification: SSODomainVerification | null;
  isVerified: boolean;
  isExpired: boolean;
  cardId: SSODomainVerification['status'];
  isSelectable: boolean;
  isSelected: boolean;
  claimedBy: string | undefined;
  onToggle: (checked: boolean) => void;
  isToggleDisabled?: boolean;
  onRemove: () => void;
  onPrepareOwnershipVerification: () => Promise<void>;
  isRemoveDisabled?: boolean;
  removeDisabledTooltip?: ReturnType<typeof localizationKeys>;
}): JSX.Element | null => {
  const { t } = useLocalizations();

  if (!domainName) {
    return null;
  }

  const removeButton = (
    <Button
      elementDescriptor={descriptors.configureSSOVerifyDomainCardRemoveButton}
      variant='ghost'
      colorScheme='neutral'
      aria-label='Remove domain'
      onClick={onRemove}
      isDisabled={isRemoveDisabled}
      sx={t => ({ flexShrink: 0, padding: t.space.$1 })}
    >
      <Icon
        icon={Close}
        sx={t => ({ width: t.sizes.$4, height: t.sizes.$4, color: t.colors.$colorMutedForeground })}
      />
    </Button>
  );

  return (
    <Col
      elementDescriptor={descriptors.configureSSOVerifyDomainCard}
      elementId={descriptors.configureSSOVerifyDomainCard.setId(cardId)}
      sx={t => ({
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$borderAlpha150,
        borderRadius: t.radii.$lg,
        background: t.colors.$colorBackground,
      })}
    >
      <Flex
        align='center'
        justify='between'
        sx={t => ({ gap: t.space.$2, padding: t.space.$4, paddingBottom: t.space.$2 })}
      >
        <Flex
          align='center'
          sx={t => ({ gap: t.space.$2, minWidth: 0 })}
        >
          <CheckboxInput
            elementDescriptor={descriptors.configureSSOVerifyDomainCardCheckbox}
            checked={isSelected}
            isDisabled={!isSelectable || isToggleDisabled}
            aria-label={t(
              localizationKeys('configureSSO.organizationDomainsStep.domainCard.checkboxLabel', {
                domain: domainName,
              }),
            )}
            onChange={e => onToggle(e.target.checked)}
          />

          <Text
            as='span'
            sx={t => ({
              fontWeight: t.fontWeights.$medium,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            })}
          >
            {domainName}
          </Text>

          <Badge
            elementDescriptor={descriptors.configureSSOVerifyDomainCardBadge}
            elementId={descriptors.configureSSOVerifyDomainCardBadge.setId(cardId)}
            colorScheme={isVerified ? 'success' : 'danger'}
            localizationKey={
              isVerified
                ? localizationKeys('configureSSO.organizationDomainsStep.domainCard.badge__verified')
                : isExpired
                  ? localizationKeys('configureSSO.organizationDomainsStep.domainCard.badge__expired')
                  : localizationKeys('configureSSO.organizationDomainsStep.domainCard.badge__unverified')
            }
          />

          {claimedBy && (
            <Badge
              elementDescriptor={descriptors.configureSSOVerifyDomainCardBadge}
              elementId={descriptors.configureSSOVerifyDomainCardBadge.setId('claimed')}
              colorScheme='primary'
              localizationKey={localizationKeys('configureSSO.organizationDomainsStep.domainCard.badge__claimed')}
            />
          )}

          {!isVerified && !isExpired && (
            <Spinner
              size='xs'
              colorScheme='neutral'
              sx={t => ({ flexShrink: 0, marginInlineStart: t.space.$1 })}
            />
          )}
        </Flex>

        {isRemoveDisabled && removeDisabledTooltip ? (
          <Tooltip.Root>
            <Tooltip.Trigger>{removeButton}</Tooltip.Trigger>
            <Tooltip.Content text={removeDisabledTooltip} />
          </Tooltip.Root>
        ) : (
          removeButton
        )}
      </Flex>

      <Box sx={{ overflow: 'hidden' }}>
        <Animated>
          {isExpired ? (
            <ExpiredNotice
              key='expired'
              expiresAt={ownershipVerification?.expiresAt ?? null}
              onPrepareOwnershipVerification={onPrepareOwnershipVerification}
            />
          ) : ownershipVerification?.verifiedAt ? (
            <Text
              key='verified'
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.organizationDomainsStep.domainCard.verifiedAtLabel', {
                date: ownershipVerification.verifiedAt,
              })}
              sx={t => ({ padding: t.space.$4, paddingTop: 0 })}
            />
          ) : (
            <TxtRecord
              key='unverified'
              ownershipVerification={ownershipVerification}
            />
          )}
        </Animated>
      </Box>
    </Col>
  );
};

const TxtRecord = ({ ownershipVerification }: { ownershipVerification: SSODomainVerification | null }): JSX.Element => {
  return (
    <Col
      elementDescriptor={descriptors.configureSSOVerifyDomainCardTxtRecord}
      sx={t => ({ gap: t.space.$3, paddingInline: t.space.$4, paddingBottom: t.space.$4 })}
    >
      <Text
        as='p'
        colorScheme='secondary'
        localizationKey={localizationKeys('configureSSO.organizationDomainsStep.domainCard.txtRecord.instructions')}
        sx={t => ({ fontSize: t.fontSizes.$sm })}
      />

      <Box
        sx={t => ({
          borderTopWidth: t.borderWidths.$normal,
          borderTopStyle: t.borderStyles.$solid,
          borderTopColor: t.colors.$borderAlpha100,
          marginInline: `calc(${t.space.$4} * -1)`,
        })}
      />

      <Flex
        wrap='wrap'
        sx={t => ({ gap: t.space.$6 })}
      >
        <RecordEntry
          label={localizationKeys('configureSSO.organizationDomainsStep.domainCard.txtRecord.typeLabel')}
          value='TXT'
        />
        <RecordEntry
          label={localizationKeys('configureSSO.organizationDomainsStep.domainCard.txtRecord.hostLabel')}
          value={ownershipVerification?.txtRecordName ?? '@'}
        />
      </Flex>

      <Flex
        align='center'
        sx={t => ({ gap: t.space.$2, minWidth: 0 })}
      >
        <Text
          as='span'
          colorScheme='secondary'
          localizationKey={localizationKeys('configureSSO.organizationDomainsStep.domainCard.txtRecord.valueLabel')}
          sx={t => ({ fontSize: t.fontSizes.$sm, flexShrink: 0 })}
        />
        <ClipboardInput
          elementDescriptor={descriptors.configureSSOVerifyDomainCardTxtRecordValue}
          value={ownershipVerification?.txtRecordValue ?? '—'}
          copyIcon={Clipboard}
          copiedIcon={Checkmark}
          sx={{ flex: 1, minWidth: 0 }}
        />
      </Flex>
    </Col>
  );
};

const RecordEntry = ({ label, value }: { label: ReturnType<typeof localizationKeys>; value: string }): JSX.Element => {
  return (
    <Flex
      align='center'
      sx={t => ({ gap: t.space.$2, minWidth: 0 })}
    >
      <Text
        as='span'
        colorScheme='secondary'
        localizationKey={label}
        sx={t => ({ fontSize: t.fontSizes.$sm, flexShrink: 0 })}
      />
      <Badge
        colorScheme='primary'
        sx={t => ({
          fontFamily: t.fonts.$buttons,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBlock: t.space.$1,
          paddingInline: t.space.$1x5,
        })}
      >
        <Box
          as='span'
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            textBoxTrim: 'trim-both',
            textBoxEdge: 'cap alphabetic',
          }}
        >
          {value}
        </Box>
      </Badge>
    </Flex>
  );
};

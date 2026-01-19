import { useReverification, useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/shared/types';

import { Actions } from '@/elements/Actions';
import { useCardState } from '@/elements/contexts';
import { PreviewButton } from '@/elements/PreviewButton';
import { ArrowRightIcon, Plus } from '@/icons';
import { Button, Col, Flex, Flow, Icon, localizationKeys, Text } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { handleError } from '@/ui/utils/errorHandler';
import { getFlagEmojiFromCountryIso, parsePhoneString, stringToFormattedPhoneString } from '@/ui/utils/phoneUtils';

type PhoneItemProps = {
  phone: PhoneNumberResource;
  onSuccess: () => void;
  onUnverifiedPhoneClick: (phone: PhoneNumberResource) => void;
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
};

const PhoneItem = ({ phone, onSuccess, onUnverifiedPhoneClick, resourceRef }: PhoneItemProps) => {
  const card = useCardState();
  const setReservedForSecondFactor = useReverification(() => phone.setReservedForSecondFactor({ reserved: true }));

  const { iso } = parsePhoneString(phone.phoneNumber);
  const flag = getFlagEmojiFromCountryIso(iso);
  const formattedPhone = stringToFormattedPhoneString(phone.phoneNumber);

  const handleSelect = async () => {
    if (phone.verification.status !== 'verified') {
      return onUnverifiedPhoneClick(phone);
    }

    card.setLoading(phone.id);
    try {
      await setReservedForSecondFactor();
      resourceRef.current = phone;
      onSuccess();
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <PreviewButton
      isLoading={card.loadingMetadata === phone.id}
      hoverAsFocus
      block
      onClick={() => void handleSelect()}
    >
      <Flex sx={t => ({ gap: t.space.$2, alignItems: 'center' })}>
        <Text sx={t => ({ fontSize: t.fontSizes.$md })}>{flag}</Text>
        <Text variant='buttonLarge'>{formattedPhone}</Text>
      </Flex>
    </PreviewButton>
  );
};

type SmsCodeScreenProps = {
  onSuccess: () => void;
  onReset: () => void;
  onAddPhoneClick: () => void;
  onUnverifiedPhoneClick: (phone: PhoneNumberResource) => void;
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
};

export const SmsCodeScreen = (props: SmsCodeScreenProps) => {
  const { onSuccess, onReset, onAddPhoneClick, onUnverifiedPhoneClick, resourceRef } = props;
  const { user } = useUser();
  const card = useCardState();

  if (!user) {
    return null;
  }

  const availablePhones = user.phoneNumbers.filter(p => !p.reservedForSecondFactor);

  return (
    <Flow.Part part='phoneCode'>
      <Card.Content sx={t => ({ padding: t.space.$none })}>
        <Header.Root
          showLogo
          sx={t => ({
            paddingTop: t.space.$8,
            paddingLeft: t.space.$8,
            paddingRight: t.space.$8,
          })}
        >
          <Header.Title localizationKey={localizationKeys('taskSetupMfa.smsCode.title')} />
          <Header.Subtitle localizationKey={localizationKeys('taskSetupMfa.smsCode.subtitle')} />
        </Header.Root>
        <Card.Alert>{card.error}</Card.Alert>
        <Col>
          <Actions
            role='menu'
            sx={t => ({
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$borderAlpha100,
            })}
          >
            {availablePhones.map(phone => (
              <PhoneItem
                key={phone.id}
                phone={phone}
                onSuccess={onSuccess}
                onUnverifiedPhoneClick={onUnverifiedPhoneClick}
                resourceRef={resourceRef}
              />
            ))}
            <PreviewButton
              hoverAsFocus
              block
              onClick={onAddPhoneClick}
              icon={ArrowRightIcon}
              showIconOnHover={false}
              iconProps={{ sx: { visibility: 'hidden' } }}
            >
              <Flex sx={t => ({ gap: t.space.$2, alignItems: 'center' })}>
                <Flex
                  sx={t => ({
                    borderRadius: t.radii.$circle,
                    borderWidth: t.borderWidths.$normal,
                    borderStyle: 'dashed',
                    borderColor: t.colors.$neutralAlpha300,
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                >
                  <Icon
                    icon={Plus}
                    sx={t => ({
                      width: t.sizes.$3,
                      height: t.sizes.$3,
                      color: t.colors.$neutralAlpha500,
                    })}
                  />
                </Flex>
                <Text
                  variant='buttonLarge'
                  localizationKey={localizationKeys('taskSetupMfa.smsCode.addPhoneNumber')}
                />
              </Flex>
            </PreviewButton>
          </Actions>
          <Flex
            justify='center'
            sx={t => ({
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$borderAlpha100,
              padding: t.space.$4,
            })}
          >
            <Button
              variant='ghost'
              onClick={onReset}
              block
              localizationKey={localizationKeys('taskSetupMfa.smsCode.cancel')}
            />
          </Flex>
        </Col>
      </Card.Content>
    </Flow.Part>
  );
};

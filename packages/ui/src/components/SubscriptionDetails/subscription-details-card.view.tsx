import type { ReactNode } from 'react';

import { Users } from '@/icons';
import { common } from '@/styledSystem';
import { Avatar } from '@/ui/elements/Avatar';

import type { LocalizationKey } from '../../customizables';
import { Col, descriptors, Flex, Icon, localizationKeys, Text } from '../../customizables';
import { SubscriptionBadge } from '../Subscriptions/badge';
import type { SubscriptionDetailsCardViewProps } from './subscription-details.types';

export const SubscriptionDetailsCardView = ({ controller, actions }: SubscriptionDetailsCardViewProps) => {
  return (
    <Col
      elementDescriptor={descriptors.subscriptionDetailsCard}
      sx={t => ({
        borderRadius: t.radii.$md,
        boxShadow: t.shadows.$tableBodyShadow,
        overflow: 'hidden',
      })}
    >
      <Col
        elementDescriptor={descriptors.subscriptionDetailsCardBody}
        gap={3}
        sx={t => ({
          padding: t.space.$3,
          background: common.mutedBackground(t),
        })}
      >
        <Flex
          elementDescriptor={descriptors.subscriptionDetailsCardHeader}
          justify='between'
          gap={2}
        >
          {controller.avatarUrl ? (
            <Avatar
              boxElementDescriptor={descriptors.planDetailAvatar}
              size={_ => 40}
              title={controller.planName}
              rounded={false}
              imageUrl={controller.avatarUrl}
            />
          ) : null}

          <Flex
            direction='col'
            justify='between'
          >
            <Text
              elementDescriptor={descriptors.subscriptionDetailsCardTitle}
              variant='h2'
              sx={t => ({
                fontSize: t.fontSizes.$lg,
                fontWeight: t.fontWeights.$semibold,
                color: t.colors.$colorForeground,
              })}
            >
              {controller.planName}
            </Text>
            <Flex>
              <Text
                variant='body'
                as='span'
                sx={t => ({
                  fontWeight: t.fontWeights.$medium,
                  textTransform: 'lowercase',
                })}
              >
                {controller.feeFormatted}
              </Text>
              <Text
                variant='body'
                as='span'
                colorScheme='secondary'
                sx={t => ({
                  fontWeight: t.fontWeights.$medium,
                  textTransform: 'lowercase',
                  whiteSpace: 'pre',
                })}
              >
                {controller.periodText}
              </Text>
            </Flex>
          </Flex>
          <Flex align='start'>
            <SubscriptionBadge
              subscription={{ status: controller.badgeStatus }}
              elementDescriptor={descriptors.subscriptionDetailsCardBadge}
            />
          </Flex>
        </Flex>
      </Col>

      {controller.hasSeats ? (
        <DetailRow
          variant='header'
          labelNode={
            <Flex
              align='center'
              gap={1}
            >
              <Icon
                icon={Users}
                size='md'
                colorScheme='neutral'
              />
              <Text localizationKey={localizationKeys('billing.seats')} />
            </Flex>
          }
          valueNode={
            <Col
              gap={1}
              align='end'
            >
              {controller.seatLimitText ? (
                <Text
                  variant='subtitle'
                  localizationKey={controller.seatLimitText}
                />
              ) : null}
              {controller.paidSeatsUsageText ? <Text variant='subtitle'>{controller.paidSeatsUsageText}</Text> : null}
            </Col>
          }
        />
      ) : null}

      {controller.pastDueDate ? (
        <DetailRow
          label={localizationKeys('billing.subscriptionDetails.pastDueAt')}
          value={controller.pastDueDate}
        />
      ) : null}

      {controller.isActive ? (
        <>
          <DetailRow
            label={controller.startedLabel}
            value={controller.startedDate}
          />
          {controller.endDate && (
            <DetailRow
              label={controller.endLabel}
              value={controller.endDate}
            />
          )}
        </>
      ) : null}

      {controller.isUpcoming ? (
        <DetailRow
          label={localizationKeys('billing.subscriptionDetails.beginsOn')}
          value={controller.beginningDate}
        />
      ) : null}

      {actions}
    </Col>
  );
};

const DetailRow = ({
  label,
  labelNode,
  value,
  valueNode,
  variant,
}: {
  label?: LocalizationKey;
  labelNode?: ReactNode;
  value?: string | LocalizationKey;
  valueNode?: ReactNode;
  variant?: 'header';
}) => (
  <Flex
    elementDescriptor={descriptors.subscriptionDetailsDetailRow}
    justify='between'
    align={valueNode ? 'start' : 'center'}
    sx={t => ({
      paddingInline: t.space.$3,
      paddingBlock: t.space.$3,
      borderBlockStartWidth: t.borderWidths.$normal,
      borderBlockStartStyle: t.borderStyles.$solid,
      borderBlockStartColor: t.colors.$borderAlpha100,
      ...(variant === 'header'
        ? {
            background: common.mutedBackground(t),
          }
        : {}),
    })}
  >
    {label ? (
      <Text
        elementDescriptor={descriptors.subscriptionDetailsDetailRowLabel}
        localizationKey={label}
      />
    ) : null}
    {labelNode ? labelNode : null}
    {valueNode ? (
      valueNode
    ) : typeof value === 'string' ? (
      <Text
        elementDescriptor={descriptors.subscriptionDetailsDetailRowValue}
        colorScheme='secondary'
      >
        {value}
      </Text>
    ) : value ? (
      <Text
        localizationKey={value}
        elementDescriptor={descriptors.subscriptionDetailsDetailRowValue}
        colorScheme='secondary'
      />
    ) : null}
  </Flex>
);

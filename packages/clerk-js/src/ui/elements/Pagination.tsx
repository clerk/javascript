import React from 'react';

import { Button, Flex, localizationKeys, Text } from '../customizables';
import { PropsOfComponent } from '../styledSystem';
import { range } from '../utils';

const PageButton = (props: PropsOfComponent<typeof Button>) => {
  const { sx, ...rest } = props;

  return (
    <Button
      size='xs'
      variant='ghost'
      colorScheme='neutral'
      sx={t => [
        {
          color: t.colors.$blackAlpha700,
        },
        sx,
      ]}
      {...rest}
    />
  );
};

type RowInfo = {
  startingRow: number;
  endingRow: number;
  allRowsCount: number;
};

type RowInfoProps = {
  rowInfo: RowInfo;
};

const RowInformation = (props: RowInfoProps) => {
  const {
    rowInfo: { startingRow, endingRow, allRowsCount },
  } = props;

  return (
    <Text>
      <Text
        as='span'
        sx={t => ({
          color: t.colors.$blackAlpha700,
        })}
        localizationKey={localizationKeys('paginationRowInfo__displaying')}
      />{' '}
      <Text as='span'>
        {startingRow} - {endingRow}
      </Text>{' '}
      <Text
        as='span'
        sx={t => ({
          color: t.colors.$blackAlpha700,
        })}
        localizationKey={localizationKeys('paginationRowInfo__of')}
      />{' '}
      <Text
        as='span'
        sx={t => ({
          color: t.colors.$blackAlpha700,
        })}
      >
        {allRowsCount}
      </Text>
    </Text>
  );
};

type PaginationProps = {
  page: number;
  count: number;
  rowInfo?: {
    startingRow: number;
    endingRow: number;
    allRowsCount: number;
  };
  siblingCount?: number;
  onChange?: (page: number) => void;
};

export const Pagination = (props: PaginationProps) => {
  const { page, count, rowInfo, siblingCount = 2, onChange } = props;

  return (
    <Flex
      justify={rowInfo ? 'between' : 'center'}
      align='center'
      sx={t => ({
        fontSize: t.fontSizes.$xs,
        '*': {
          fontSize: 'inherit',
        },
      })}
    >
      {rowInfo && <RowInformation rowInfo={rowInfo} />}

      <Flex gap={2}>
        <PageButton
          isDisabled={page === 1}
          localizationKey={localizationKeys('paginationButton__previous')}
          onClick={() => {
            onChange?.(page - 1);
          }}
        />
        {range(1, count).map(p => {
          if (Math.abs(page - p) < siblingCount || p === count || p === 1) {
            return (
              <PageButton
                key={p}
                sx={t => ({ color: page === p ? t.colors.$black : undefined })}
                onClick={() => {
                  onChange?.(p);
                }}
              >
                {p}
              </PageButton>
            );
          }

          if (Math.abs(page - p) === siblingCount) {
            return (
              <Flex
                center
                key={p}
              >
                <Text
                  sx={t => ({
                    color: t.colors.$blackAlpha500,
                  })}
                >
                  ...
                </Text>
              </Flex>
            );
          }

          return null;
        })}
        <PageButton
          isDisabled={page === count}
          localizationKey={localizationKeys('paginationButton__next')}
          onClick={() => {
            onChange?.(page + 1);
          }}
        />
      </Flex>
    </Flex>
  );
};

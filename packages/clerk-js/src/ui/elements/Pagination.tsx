import React from 'react';

import { Button, Flex, Text } from '../customizables';
import { PropsOfComponent } from '../styledSystem';
import { range } from '../utils';

const PageButton = (props: PropsOfComponent<typeof Button>) => {
  return (
    <Button
      size='xs'
      variant='ghost'
      colorScheme='neutral'
      {...props}
    />
  );
};

type PaginationProps = {
  page: number;
  count: number;
  showRowInfo?: {
    startingRow: number;
    endingRow: number;
    allRowsCount: number;
  };
  siblingCount?: number;
  onChange?: (page: number) => void;
};

export const Pagination = (props: PaginationProps) => {
  const { page, count, showRowInfo, siblingCount = 2, onChange } = props;

  return (
    <Flex
      justify={showRowInfo ? 'between' : 'center'}
      align='center'
      sx={t => ({
        fontSize: t.fontSizes.$xs,
        '*': {
          fontSize: 'inherit',
        },
      })}
    >
      {showRowInfo && (
        <Text
          sx={t => ({
            color: t.colors.$blackAlpha700,
          })}
        >
          Displaying{' '}
          <Text as='span'>
            {showRowInfo.startingRow} - {showRowInfo.endingRow}{' '}
          </Text>
          <Text
            as='span'
            sx={t => ({
              color: t.colors.$blackAlpha700,
            })}
          >
            of {showRowInfo.allRowsCount}
          </Text>
        </Text>
      )}

      <Flex gap={2}>
        <PageButton
          isDisabled={page === 1}
          onClick={() => {
            onChange?.(page - 1);
          }}
        >
          Previous
        </PageButton>
        {range(1, count).map(p => {
          if (Math.abs(page - p) < siblingCount || p === count || p === 1) {
            return (
              <PageButton
                key={p}
                sx={t => ({ color: page === p ? t.colors.$black : t.colors.$blackAlpha700 })}
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
          onClick={() => {
            onChange?.(page + 1);
          }}
        >
          Next
        </PageButton>
      </Flex>
    </Flex>
  );
};

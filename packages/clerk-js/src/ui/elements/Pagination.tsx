import { useState } from 'react';

import { Button, descriptors, Flex, Icon, localizationKeys, Text } from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import { CaretLeft, CaretRight } from '../icons';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { mqu } from '../styledSystem';
import { range } from '../utils';

type UsePaginationProps = {
  defaultPage?: number;
};

export const usePagination = (props?: UsePaginationProps) => {
  const { defaultPage = 1 } = props || {};
  const [page, setPage] = useState(defaultPage);

  return { page, changePage: setPage };
};

export type PageButtonProps = PropsOfComponent<typeof Button> & {
  isActive?: boolean;
  icon?: React.ComponentType | React.ReactElement;
  iconElementDescriptor?: ElementDescriptor;
  iconElementId?: ElementId;
  iconSx?: ThemableCssProp;
};

const PageButton = (props: PageButtonProps) => {
  const { sx, isActive, children, ...rest } = props;

  return (
    <Button
      size='xs'
      variant='secondary'
      sx={t => [
        {
          color: t.colors.$colorText,
          opacity: isActive ? 1 : t.opacity.$inactive,
          padding: `${t.space.$0x5} ${t.space.$0x5}`,
        },
        sx,
      ]}
      elementDescriptor={descriptors.paginationButton}
      {...rest}
    >
      {props.icon && (
        <Icon
          elementDescriptor={descriptors.paginationButtonIcon}
          icon={props.icon as React.ComponentType}
        />
      )}
      {children}
    </Button>
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
        elementDescriptor={descriptors.paginationRowText}
        elementId={descriptors.paginationRowText?.setId('displaying')}
        sx={t => ({ opacity: t.opacity.$inactive })}
        localizationKey={localizationKeys('paginationRowText__displaying')}
      />{' '}
      <Text
        as='span'
        elementDescriptor={descriptors.paginationRowText}
        elementId={descriptors.paginationRowText?.setId('rowsCount')}
        sx={t => ({ fontWeight: t.fontWeights.$medium })}
      >
        {startingRow === endingRow && [0, 1].includes(startingRow) ? startingRow : `${startingRow} – ${endingRow}`}
      </Text>{' '}
      <Text
        as='span'
        elementDescriptor={descriptors.paginationRowText}
        elementId={descriptors.paginationRowText?.setId('displaying')}
        sx={t => ({ opacity: t.opacity.$inactive })}
        localizationKey={localizationKeys('paginationRowText__of')}
      />{' '}
      <Text
        as='span'
        elementDescriptor={descriptors.paginationRowText}
        elementId={descriptors.paginationRowText?.setId('allRowsCount')}
      >
        {allRowsCount}
      </Text>
    </Text>
  );
};

const shouldShowPageButton = (currentPage: number, pageToShow: number, siblingCount: number, pageCount: number) => {
  return Math.abs(currentPage - pageToShow) <= siblingCount || pageToShow === pageCount || pageToShow === 1;
};

const shouldShowDots = (currentPage: number, pageToShow: number, siblingCount: number) => {
  return Math.abs(currentPage - pageToShow) === siblingCount + 1;
};

const ThreeDots = () => (
  <Flex center>
    <Text sx={t => ({ color: t.colors.$blackAlpha500 })}>...</Text>
  </Flex>
);

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
  const { page, count, rowInfo, siblingCount = 1, onChange } = props;

  return (
    <Flex
      justify={rowInfo ? 'between' : 'center'}
      align='center'
      sx={t => ({
        fontSize: t.fontSizes.$sm,
        '*': {
          fontSize: 'inherit',
        },
        [mqu.sm]: {
          flexDirection: 'column',
          gap: t.space.$2,
        },
      })}
    >
      {rowInfo && <RowInformation rowInfo={rowInfo} />}

      <Flex gap={2}>
        <PageButton
          isDisabled={page <= 1}
          icon={CaretLeft}
          onClick={() => {
            onChange?.(page - 1);
          }}
        />
        {range(1, count).map(p => {
          if (shouldShowPageButton(page, p, siblingCount, count)) {
            return (
              <PageButton
                key={p}
                isActive={p === page}
                variant='ghost'
                onClick={() => {
                  onChange?.(p);
                }}
              >
                {p}
              </PageButton>
            );
          }

          if (shouldShowDots(page, p, siblingCount)) {
            return <ThreeDots key={p} />;
          }

          return null;
        })}
        <PageButton
          isDisabled={page >= count || page < 1}
          icon={CaretRight}
          onClick={() => {
            onChange?.(page + 1);
          }}
        />
      </Flex>
    </Flex>
  );
};

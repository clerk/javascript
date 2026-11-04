'use client';

import type { CSSProperties, ReactNode } from 'react';

export function Spec<Row, Column>({
  axis,
  rows,
  columns,
  rowLabel,
  columnLabel,
  cell,
  align = 'center',
  style,
}: {
  axis: string;
  rows: readonly Row[];
  columns: readonly Column[];
  rowLabel: (row: Row) => string;
  columnLabel: (column: Column) => string;
  cell: (row: Row, column: Column, rowIndex: number, columnIndex: number) => ReactNode;
  align?: 'center' | 'start';
  style?: CSSProperties;
}) {
  return (
    <div
      className='studio-spec'
      data-align={align}
      style={{
        gridTemplateColumns: `0 repeat(${columns.length}, auto)`,
        gridTemplateRows: '0',
        marginInlineStart: typeof style?.columnGap === 'number' ? -style.columnGap : undefined,
        ...style,
      }}
    >
      <span
        className='studio-spec-axis'
        style={{ gridArea: '1 / 1 / 2 / 2' }}
      >
        {axis}
      </span>
      {columns.map((column, columnIndex) => (
        <span
          key={columnLabel(column)}
          className='studio-spec-label'
          data-axis='column'
          style={{ gridArea: `1 / ${columnIndex + 2} / 2 / ${columnIndex + 3}` }}
        >
          {columnLabel(column)}
        </span>
      ))}
      {rows.map((row, rowIndex) => (
        <div
          key={rowLabel(row)}
          className='studio-spec-row'
        >
          <span
            className='studio-spec-label'
            data-axis='row'
            style={{ gridArea: `${rowIndex + 2} / 1 / ${rowIndex + 3} / 2` }}
          >
            {rowLabel(row)}
          </span>
          {columns.map((column, columnIndex) => (
            <span
              key={columnLabel(column)}
              className='studio-spec-cell'
              style={{ gridArea: `${rowIndex + 2} / ${columnIndex + 2}` }}
            >
              {cell(row, column, rowIndex, columnIndex)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

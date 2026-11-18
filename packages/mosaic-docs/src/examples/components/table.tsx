'use client';

import { Badge } from '@clerk/mosaic/components/badge';
import { Table } from '@clerk/mosaic/components/table';
import { useState } from 'react';

const members = [
  { id: 'ada', name: 'Ada Lovelace', email: 'ada@example.com', role: 'Admin' },
  { id: 'grace', name: 'Grace Hopper', email: 'grace@example.com', role: 'Member' },
  { id: 'alan', name: 'Alan Turing', email: 'alan@example.com', role: 'Member' },
];

export default function TableExample() {
  const [query, setQuery] = useState('');
  const rows = members.filter(member => member.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <Table.Toolbar>
        <Table.Search
          label='Search members'
          clearLabel='Clear search'
          value={query}
          onValueChange={setQuery}
        />
      </Table.Toolbar>
      <Table.Root
        aria-label='Members'
        selectionMode='multiple'
      >
        <Table.Header>
          <Table.SelectionColumn aria-label='Select all' />
          <Table.Column
            value='name'
            rowHeader
          >
            Name
          </Table.Column>
          <Table.Column value='email'>Email</Table.Column>
          <Table.Column
            value='role'
            align='end'
          >
            Role
          </Table.Column>
        </Table.Header>
        <Table.Body
          items={rows}
          itemToStringValue={member => member.id}
          renderEmptyState={() => 'No members match your search.'}
        >
          {member => (
            <Table.Row>
              <Table.SelectionCell aria-label={`Select ${member.name}`} />
              <Table.Cell>{member.name}</Table.Cell>
              <Table.Cell>{member.email}</Table.Cell>
              <Table.Cell align='end'>
                <Badge color='neutral'>{member.role}</Badge>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </div>
  );
}

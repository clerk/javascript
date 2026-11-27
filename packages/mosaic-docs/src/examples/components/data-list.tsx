'use client';

import { DataList } from '@clerk/mosaic/components/data-list';

export default function DataListExample() {
  return (
    <DataList.Root>
      <DataList.Item>
        <DataList.Label>Browser</DataList.Label>
        <DataList.Value>Chrome 131</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>IP address</DataList.Label>
        <DataList.Value>192.0.2.41</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Location</DataList.Label>
        <DataList.Value>Lisbon, Portugal</DataList.Value>
      </DataList.Item>
    </DataList.Root>
  );
}

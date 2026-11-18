import type { ComponentDoc } from '../../docs-schema';
import type { MosaicComponentProps } from '../../props';
import type { DataListProps } from './data-list';

export default {
  name: 'DataList',
  description:
    'Label and value pairs for read-only detail, as a `dl` of `dt` and `dd`, so assistive technology reads each value with its label.',
  useFor: [
    'read-only details such as the fields of a device or payment method',
    'a list of label and value pairs',
    'session or account metadata',
  ],
  keywords: ['data list', 'description list', 'dl', 'key value', 'details', 'metadata', 'properties'],
  practices: [
    { do: true, text: 'Wrap each pair in `DataList.Item`.' },
    { do: true, text: 'Pass `divided={false}` when the pairs are few enough to scan as a block.' },
    { do: false, text: 'Put long text in `DataList.Value`. It truncates to one line.' },
  ],
  parts: {
    'DataList.Root': {
      description: 'The `dl`. Carries `data-divided`.',
      slot: 'cl-data-list',
      props: { divided: { type: 'boolean', doc: 'Draws rules between the items.', default: 'true' } },
    },
    'DataList.Item': { description: 'One pair, as a `div`.', slot: 'cl-data-list-item' },
    'DataList.Label': { description: 'The `dt`.', slot: 'cl-data-list-label' },
    'DataList.Value': { description: 'The `dd`. Truncates to one line.', slot: 'cl-data-list-value' },
  },
  examples: [
    {
      title: 'Device details',
      code: `
<DataList.Root>
  <DataList.Item>
    <DataList.Label>{m.ipAddress}</DataList.Label>
    <DataList.Value>{session.ipAddress}</DataList.Value>
  </DataList.Item>
</DataList.Root>
`,
    },
  ],
} satisfies ComponentDoc<{
  'DataList.Root': DataListProps;
  'DataList.Item': MosaicComponentProps<'div'>;
  'DataList.Label': MosaicComponentProps<'dt'>;
  'DataList.Value': MosaicComponentProps<'dd'>;
}>;

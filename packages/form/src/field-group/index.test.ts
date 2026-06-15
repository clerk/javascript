import { describe, expect, it } from 'vitest';

import { createForm } from '../form';
import { createFieldGroup } from './index';

describe('createFieldGroup', () => {
  it('projects local keys onto the parent form via a prefix', () => {
    const form = createForm({ defaultValues: { address: { street: '', city: '' } } });
    const group = createFieldGroup({ form, fields: 'address' });
    expect(group.resolve('street')).toBe('address.street');
    group.setFieldValue('street', 'Main St');
    expect(form.getFieldValue('address.street')).toBe('Main St');
    expect(group.getFieldValue('street')).toBe('Main St');
  });

  it('projects local keys via an explicit field map', () => {
    const form = createForm({ defaultValues: { billingStreet: '', shippingStreet: '' } });
    const group = createFieldGroup({ form, fields: { street: 'billingStreet' } });
    group.setFieldValue('street', '1 Infinite Loop');
    expect(form.getFieldValue('billingStreet')).toBe('1 Infinite Loop');
  });

  it('builds a field with validators on the parent form', () => {
    const form = createForm({ defaultValues: { address: { street: '' } } });
    const group = createFieldGroup({ form, fields: 'address' });
    group.getField('street', { onChange: ({ value }: { value: unknown }) => (value ? undefined : 'Required') });
    form.setFieldValue('address.street', '');
    expect(form.state.fieldMeta['address.street'].errors).toEqual(['Required']);
  });
});

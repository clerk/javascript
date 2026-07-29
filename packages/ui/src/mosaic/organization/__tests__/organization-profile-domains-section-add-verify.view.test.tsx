import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Snapshot } from '../../machine/types';
import { MosaicProvider } from '../../MosaicProvider';
import type { OrganizationProfileEnrollmentOption } from '../organization-profile-domains-section.controller';
import type { OrganizationProfileDomainsSectionAddVerifyContext } from '../organization-profile-domains-section-add-verify.machine';
import { OrganizationProfileDomainsSectionAddVerifyView } from '../organization-profile-domains-section-add-verify.view';

const OPTIONS: OrganizationProfileEnrollmentOption[] = [
  { value: 'manual_invitation', label: 'No automatic enrollment', description: 'Manual only.' },
  { value: 'automatic_invitation', label: 'Automatic invitations', description: 'Auto invited.' },
];

function snapshot(
  value: Snapshot<OrganizationProfileDomainsSectionAddVerifyContext>['value'],
  context: Partial<OrganizationProfileDomainsSectionAddVerifyContext> = {},
): Snapshot<OrganizationProfileDomainsSectionAddVerifyContext> {
  return {
    value,
    status: 'active',
    context: {
      domainId: 'dmn_1',
      domainName: 'clerk.com',
      draftName: '',
      draftEmail: '',
      draftCode: '',
      selectedEnrollmentMode: '',
      error: null,
      createDomain: async () => ({ id: '', name: '', verified: false }),
      prepareVerification: async () => {},
      attemptVerification: async () => ({ verified: false }),
      updateEnrollmentMode: async () => {},
      ...context,
    },
  };
}

function renderView(snap: Snapshot<OrganizationProfileDomainsSectionAddVerifyContext>, send = vi.fn()) {
  render(
    <MosaicProvider>
      <OrganizationProfileDomainsSectionAddVerifyView
        snapshot={snap}
        send={send}
        enrollmentOptions={OPTIONS}
      />
    </MosaicProvider>,
  );
  return { send };
}

describe('OrganizationProfileDomainsSectionAddVerifyView', () => {
  it('collects and submits the domain name on the name step', () => {
    const { send } = renderView(snapshot('enteringName', { draftName: 'clerk.com' }));

    expect(screen.getByText('Add domain')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'clerk.dev' } });
    expect(send).toHaveBeenCalledWith({ type: 'TYPE_NAME', value: 'clerk.dev' });

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(send).toHaveBeenCalledWith({ type: 'SUBMIT_NAME' });
  });

  it('shows the domain suffix and submits the email on the email step', () => {
    const { send } = renderView(snapshot('enteringEmail', { draftEmail: 'alex' }));

    expect(screen.getByText('@clerk.com')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Send code' }));
    expect(send).toHaveBeenCalledWith({ type: 'SUBMIT_EMAIL' });
  });

  it('supports verify, resend and back on the code step', () => {
    const { send } = renderView(snapshot('enteringCode', { draftEmail: 'alex', draftCode: '424242' }));

    fireEvent.click(screen.getByRole('button', { name: 'Resend code' }));
    expect(send).toHaveBeenCalledWith({ type: 'RESEND' });

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(send).toHaveBeenCalledWith({ type: 'BACK' });

    fireEvent.click(screen.getByRole('button', { name: 'Verify' }));
    expect(send).toHaveBeenCalledWith({ type: 'SUBMIT_CODE' });
  });

  it('selects a mode and finishes on the enrollment step', () => {
    const { send } = renderView(snapshot('selectingEnrollment', { selectedEnrollmentMode: 'automatic_invitation' }));

    fireEvent.click(screen.getByRole('radio', { name: /No automatic enrollment/ }));
    expect(send).toHaveBeenCalledWith({ type: 'SELECT_MODE', value: 'manual_invitation' });

    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(send).toHaveBeenCalledWith({ type: 'SUBMIT_ENROLLMENT' });
  });

  it('renders machine errors', () => {
    renderView(snapshot('enteringName', { error: 'Domain taken' }));
    expect(screen.getByText('Domain taken')).toBeInTheDocument();
  });

  it('renders nothing interactive when closed', () => {
    renderView(snapshot('closed'));
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
  });
});

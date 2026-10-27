import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, onTestFinished } from 'vitest';
import { page } from 'vitest/browser';

import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserButton } from '../user-button';

const GAP = 4;

const acme = fapiOrganization({ id: 'org_1', name: 'Acme' });
const memberships = [fapiMembership(acme)];
const alice = fapiUser({
  id: 'user_1',
  first_name: 'Alice',
  last_name: 'Smith',
  email_addresses: [fapiEmailAddress({ id: 'idn_alice', email_address: 'alice@example.com' })],
  organization_memberships: memberships,
});

describe('UserButton badged avatar customization', () => {
  it('keeps the gap around a resized badge in the trigger', async () => {
    customize(`.cl-user-button-avatar { --cl-avatar-badge-size: 24px; --cl-avatar-badge-gap: ${GAP}px; }`);
    await renderSignedIn();

    await expectGapAroundBadge(await triggerAvatar());
  });

  it('keeps the gap when the trigger avatar is resized', async () => {
    customize(
      `.cl-user-button-avatar { width: 64px !important; height: 64px !important; --cl-avatar-badge-gap: ${GAP}px; }`,
    );
    await renderSignedIn();

    await expectGapAroundBadge(await triggerAvatar());
  });

  it('keeps the gap around a resized badge in the header', async () => {
    customize(`.cl-user-button-avatar { --cl-avatar-badge-size: 24px; --cl-avatar-badge-gap: ${GAP}px; }`);
    await renderSignedIn();
    await userEvent.setup().click(screen.getByRole('button', { name: /Open account menu/ }));

    await expectGapAroundBadge(await headerAvatar());
  });

  it('keeps the gap around a resized badge in right-to-left layouts', async () => {
    customize(`.cl-user-button-avatar { --cl-avatar-badge-size: 24px; --cl-avatar-badge-gap: ${GAP}px; }`);
    document.documentElement.dir = 'rtl';
    onTestFinished(() => document.documentElement.removeAttribute('dir'));
    await renderSignedIn();

    await expectGapAroundBadge(await triggerAvatar());
  });
});

function customize(css: string) {
  const sheet = document.createElement('style');
  sheet.textContent = `.cl-user-button-avatar { --cl-color-neutral-alpha-200: #000; } ${css}`;
  document.head.append(sheet);
  onTestFinished(() => sheet.remove());
}

async function renderSignedIn() {
  serveFapi({
    client: fapiClient([fapiSession({ id: 'sess_1', user: alice, last_active_organization_id: acme.id })]),
    memberships,
  });
  await renderWithClerk(<UserButton />);
}

async function triggerAvatar(): Promise<HTMLElement> {
  const trigger = await screen.findByRole('button', { name: /Open account menu/ });
  return requiredAvatar(trigger);
}

async function headerAvatar(): Promise<HTMLElement> {
  const dialog = await screen.findByRole('dialog');
  const header = dialog.querySelector<HTMLElement>('.cl-user-button-header');
  if (!header) {
    throw new Error('No header in the popup');
  }
  return requiredAvatar(header);
}

function requiredAvatar(container: HTMLElement): HTMLElement {
  const avatar = container.querySelector<HTMLElement>('.cl-user-button-avatar');
  if (!avatar) {
    throw new Error('No badged avatar');
  }
  return avatar;
}

async function expectGapAroundBadge(avatar: HTMLElement) {
  const badge = avatar.querySelector<HTMLElement>('.cl-user-button-avatar-badge');
  if (!badge) {
    throw new Error('No badge');
  }
  const box = badge.getBoundingClientRect();
  const radius = box.width / 2;
  const towardLead = document.documentElement.dir === 'rtl' ? 1 : -1;
  const center = { x: box.left + radius, y: box.top + radius };
  const along = (distance: number) => ({
    x: center.x + (towardLead * distance) / Math.SQRT2,
    y: center.y - distance / Math.SQRT2,
  });

  const pixels = await sampleViewport();

  expect({
    badge: pixels(along(radius - 2)),
    innerGap: pixels(along(radius + GAP / 2)),
    outerGap: pixels(along(radius + GAP - 1)),
    lead: pixels(along(radius + GAP + 2)),
  }).toEqual({ badge: 'dark', innerGap: 'light', outerGap: 'light', lead: 'dark' });
}

async function sampleViewport(): Promise<(point: { x: number; y: number }) => 'dark' | 'light'> {
  const base64 = await page.screenshot({ save: false });
  const image = new Image();
  image.src = `data:image/png;base64,${base64}`;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('No 2D canvas');
  }
  context.drawImage(image, 0, 0);
  const scale = image.width / window.innerWidth;

  return ({ x, y }) => {
    const [r = 0, g = 0, b = 0] = context.getImageData(Math.round(x * scale), Math.round(y * scale), 1, 1).data;
    return (r + g + b) / 3 < 128 ? 'dark' : 'light';
  };
}

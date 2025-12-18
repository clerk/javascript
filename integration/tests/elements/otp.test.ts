import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('OTP @elements', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

  test.afterAll(async () => {
    await app.teardown();
  });

  test.beforeEach(async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/otp');
  });

  const otpTypes = {
    simpleOtp: 'simple-otp',
    segmentedOtp: 'segmented-otp',
    segmentedOtpWithProps: 'segmented-otp-with-props',
  } as const;

  for (const otpType of [otpTypes.simpleOtp, otpTypes.segmentedOtp]) {
    test.describe(`Type: ${otpType}`, () => {
      test(`should receive correct standard props`, async ({ page }) => {
        const otp = page.getByTestId(otpType);

        await expect(otp).toHaveAttribute('autocomplete', 'one-time-code');
        await expect(otp).toHaveAttribute('spellcheck', 'false');
        await expect(otp).toHaveAttribute('inputmode', 'numeric');
        await expect(otp).toHaveAttribute('maxlength', '6');
        await expect(otp).toHaveAttribute('minlength', '6');
        await expect(otp).toHaveAttribute('pattern', '[0-9]{6}');
        await expect(otp).toHaveAttribute('type', 'text');
      });

      test(`should change the input value`, async ({ page }) => {
        const otp = page.getByTestId(otpType);

        // Check that the input starts with an empty value
        await expect(otp).toHaveValue('');

        await otp.pressSequentially('1');
        await expect(otp).toHaveValue('1');

        await otp.pressSequentially('23456');
        await expect(otp).toHaveValue('123456');
      });
    });
  }

  test.describe(`Type: ${otpTypes.simpleOtp}`, () => {
    test(`should prevent typing greater than max length`, async ({ page }) => {
      const otp = page.getByTestId(otpTypes.simpleOtp);

      await otp.pressSequentially('1234567');
      await expect(otp).toHaveValue('123456');
    });
  });

  test.describe(`Type: ${otpTypes.segmentedOtp}`, () => {
    test('renders hidden segments', async ({ page }) => {
      const otpSegmentsWrapper = page.locator('.segmented-otp-wrapper');

      await expect(otpSegmentsWrapper).toHaveAttribute('aria-hidden', 'true');
      // Check that 6 segments are rendered
      await expect(otpSegmentsWrapper.locator('> div')).toHaveCount(6);
    });

    test(`should prevent typing greater than max length`, async ({ page }) => {
      const otp = page.getByTestId(otpTypes.segmentedOtp);

      await otp.pressSequentially('1234567');
      // With the segmented OTP we expect the last char to be replaced by any new input
      await expect(otp).toHaveValue('123457');
    });

    test(`should put values into segments`, async ({ page }) => {
      const otp = page.getByTestId(otpTypes.segmentedOtp);

      // Check initial state before any interaction
      for (let i = 0; i < 6; i++) {
        await expect(page.getByTestId(`segmented-otp-${i}`)).toHaveText('');
        await expect(page.getByTestId(`segmented-otp-${i}`)).toHaveAttribute('data-status', 'none');
      }

      await otp.pressSequentially('123456');

      for (let i = 0; i < 6; i++) {
        await expect(page.getByTestId(`segmented-otp-${i}`)).toHaveText(`${i + 1}`);
      }
    });

    test('should set hover status on segments', async ({ page }) => {
      const otp = page.getByTestId(otpTypes.segmentedOtp);

      await otp.hover();
      for (let i = 0; i < 6; i++) {
        await expect(page.getByTestId(`segmented-otp-${i}`)).toHaveAttribute('data-status', 'hovered');
      }
    });

    test('should not set hover status on segments if they are focused', async ({ page }) => {
      const otp = page.getByTestId(otpTypes.segmentedOtp);

      await otp.pressSequentially('123');
      await otp.hover();
      for (let i = 0; i < 6; i++) {
        await expect(page.getByTestId(`segmented-otp-${i}`)).not.toHaveAttribute('data-status', 'hovered');
      }
    });

    test('should set cursor and selected status on segments', async ({ page }) => {
      const otp = page.getByTestId(otpTypes.segmentedOtp);

      await otp.pressSequentially('12');

      await expect(page.getByTestId('segmented-otp-0')).toHaveAttribute('data-status', 'none');
      await expect(page.getByTestId('segmented-otp-1')).toHaveAttribute('data-status', 'none');
      await expect(page.getByTestId('segmented-otp-2')).toHaveAttribute('data-status', 'cursor');

      await otp.press('ArrowLeft');

      await expect(page.getByTestId('segmented-otp-0')).toHaveAttribute('data-status', 'none');
      await expect(page.getByTestId('segmented-otp-1')).toHaveAttribute('data-status', 'selected');
      await expect(page.getByTestId('segmented-otp-2')).toHaveAttribute('data-status', 'none');

      await otp.press('ArrowLeft');

      await expect(page.getByTestId('segmented-otp-0')).toHaveAttribute('data-status', 'selected');
      await expect(page.getByTestId('segmented-otp-1')).toHaveAttribute('data-status', 'none');
    });

    test('should replace selected segment with new input', async ({ page }) => {
      const otp = page.getByTestId(otpTypes.segmentedOtp);

      await otp.pressSequentially('12');

      await otp.press('ArrowLeft');
      await expect(page.getByTestId('segmented-otp-1')).toHaveAttribute('data-status', 'selected');
      await otp.pressSequentially('1');
      await expect(otp).toHaveValue('11');
    });

    test('should replace multi-selected segments with new input', async ({ page }) => {
      const otp = page.getByTestId(otpTypes.segmentedOtp);

      await otp.pressSequentially('12345');
      // Mark two segments to the left of the cursor
      await otp.press('Shift+ArrowLeft');
      await otp.press('Shift+ArrowLeft');
      await expect(page.getByTestId('segmented-otp-3')).toHaveAttribute('data-status', 'selected');
      await expect(page.getByTestId('segmented-otp-4')).toHaveAttribute('data-status', 'selected');
      await otp.pressSequentially('1');

      await expect(otp).toHaveValue('1231');

      // Mark all segments
      await otp.press('ControlOrMeta+a');
      await otp.pressSequentially('1');

      await expect(otp).toHaveValue('1');
    });

    test('should backspace char', async ({ page }) => {
      const otp = page.getByTestId(otpTypes.segmentedOtp);

      await otp.pressSequentially('123');
      await otp.press('Backspace');

      await expect(otp).toHaveValue('12');
      await expect(page.getByTestId('segmented-otp-2')).toHaveAttribute('data-status', 'cursor');
    });

    test('should backspace all chars with modifier', async ({ page }) => {
      const otp = page.getByTestId(otpTypes.segmentedOtp);

      await otp.pressSequentially('123');
      await otp.press('ControlOrMeta+Backspace');

      await expect(otp).toHaveValue('');
      await expect(page.getByTestId('segmented-otp-0')).toHaveAttribute('data-status', 'cursor');
    });

    test('should backspace selected char', async ({ page }) => {
      const otp = page.getByTestId(otpTypes.segmentedOtp);

      await otp.pressSequentially('123');
      await otp.press('ArrowLeft');
      await otp.press('ArrowLeft');
      await otp.press('Backspace');

      await expect(otp).toHaveValue('13');
    });

    test('should forward-delete char when pressing delete', async ({ page }) => {
      const otp = page.getByTestId(otpTypes.segmentedOtp);

      await otp.pressSequentially('1234');

      await otp.press('ArrowLeft');
      await otp.press('ArrowLeft');
      // Wait for selection to update - cursor should be on index 2 (selecting "3")
      await expect(page.getByTestId('segmented-otp-2')).toHaveAttribute('data-status', 'selected');
      await otp.press('Delete');

      await expect(otp).toHaveValue('124');
      await otp.press('ArrowRight');
      await expect(page.getByTestId('segmented-otp-2')).toHaveAttribute('data-status', 'selected');
      await otp.press('Delete');
      await expect(otp).toHaveValue('12');
    });
  });

  test.describe('Custom props', () => {
    test('length', async ({ page }) => {
      const otp = page.getByTestId(otpTypes.segmentedOtpWithProps);
      const otpSegmentsWrapper = page.locator('.segmented-otp-with-props-wrapper');

      await expect(otp).toHaveAttribute('maxlength', '4');
      await expect(otp).toHaveAttribute('minlength', '4');
      await expect(otp).toHaveAttribute('pattern', '[0-9]{4}');

      // Check that only 4 segments are rendered
      await expect(otpSegmentsWrapper.locator('> div')).toHaveCount(4);
    });
  });
});

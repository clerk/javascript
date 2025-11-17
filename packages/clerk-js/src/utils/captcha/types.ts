import type { CaptchaProvider, CaptchaWidgetType } from '@clerk/shared/types';

export type CaptchaOptions = {
  action?: 'verify' | 'signup' | 'heartbeat';
  captchaProvider: CaptchaProvider;
  closeModal?: () => Promise<unknown>;
  invisibleSiteKey: string;
  modalContainerQuerySelector?: string;
  modalWrapperQuerySelector?: string;
  nonce?: string;
  openModal?: () => Promise<unknown>;
  siteKey: string;
  widgetType: CaptchaWidgetType;
};

export type GetCaptchaTokenReturn = {
  captchaToken: string;
  captchaWidgetType: CaptchaWidgetType;
};

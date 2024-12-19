import type { CaptchaProvider, CaptchaWidgetType } from '@clerk/types';

export type CaptchaOptions = {
  siteKey: string;
  scriptUrl: string;
  widgetType: CaptchaWidgetType;
  invisibleSiteKey: string;
  captchaProvider: CaptchaProvider;
  modalContainerQuerySelector?: string;
  modalWrapperQuerySelector?: string;
  openModal?: () => Promise<unknown>;
  closeModal?: () => Promise<unknown>;
};

export type GetCaptchaTokenReturn = {
  captchaToken: string;
  captchaWidgetType: CaptchaWidgetType;
};

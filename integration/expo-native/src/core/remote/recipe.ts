import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { RecipeAnswers, RecipeRequest, SessionDevice, SessionDeviceFactory, SessionDeviceRef } from './protocol.ts';

export function answer(device: SessionDevice, request: RecipeRequest): RecipeAnswers[RecipeRequest['op']] {
  switch (request.op) {
    case 'build':
      return device.build(request.work);
    case 'record':
      return { start: device.record.start(request.file), stop: device.record.stop?.(request.file) ?? null, collect: device.record.collect?.(request.file) ?? [] };
    case 'logs':
      return device.logs(new Date(request.since), request.predicate);
  }
}

if (import.meta.main) {
  const asked = JSON.parse(process.argv[2] ?? '') as { readonly device: SessionDeviceRef; readonly request: RecipeRequest };
  const module = (await import(pathToFileURL(resolve(process.env.VERIFY_SESSION_DEVICE_MODULE ?? '')).href)) as { default: SessionDeviceFactory };
  process.stdout.write(JSON.stringify(answer(module.default(asked.device), asked.request)));
}

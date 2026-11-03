import { http, HttpResponse } from 'msw';

import type { FakeFapiState } from '../fake-fapi';
import { envelope, error, requestUser } from './shared';

export type FakeDemoInstance = {
  id: string;
  name: string;
  environment: 'development' | 'production';
};

export function demoHandlers(state: FakeFapiState, url: (path: string) => string) {
  return [
    http.get(url('/v1/demo'), ({ request }) =>
      requestUser(state, request) ? envelope(state.demo, null) : error('session_missing', 401),
    ),
    http.post(url('/v1/demo'), async ({ request }) => {
      if (!requestUser(state, request)) {
        return error('session_missing', 401);
      }
      if (new URL(request.url).searchParams.get('_method') !== 'PUT') {
        return error('method_not_allowed', 405);
      }
      const name = new URLSearchParams(await request.text()).get('name')?.trim();
      if (!name) {
        return HttpResponse.json(
          { errors: [{ code: 'form_param_required', message: 'Enter a name.', meta: { param_name: 'name' } }] },
          { status: 422 },
        );
      }
      state.demo = { ...state.demo, name };
      return envelope(state.demo, state.client);
    }),
  ];
}

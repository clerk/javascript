import { forwardRefParts } from './rules/forward-ref-parts.ts';
import { modelCallbacksReturnClerkCall } from './rules/model-callbacks-return-clerk-call.ts';
import { noDynamicMessageCatalogs } from './rules/no-dynamic-message-catalogs.ts';
import { noModelReactState } from './rules/no-model-react-state.ts';
import { noRawInvoke } from './rules/no-raw-invoke.ts';
import { noRenderClock } from './rules/no-render-clock.ts';

export default {
  rules: {
    'forward-ref-parts': forwardRefParts,
    'model-callbacks-return-clerk-call': modelCallbacksReturnClerkCall,
    'no-dynamic-message-catalogs': noDynamicMessageCatalogs,
    'no-model-react-state': noModelReactState,
    'no-raw-invoke': noRawInvoke,
    'no-render-clock': noRenderClock,
  },
};

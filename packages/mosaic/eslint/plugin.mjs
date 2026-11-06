import { forwardRefParts, noDynamicMessageCatalogs, noModelReactState, noRenderClock } from './rules.mjs';

export default {
  rules: {
    'no-model-react-state': noModelReactState,
    'no-dynamic-message-catalogs': noDynamicMessageCatalogs,
    'forward-ref-parts': forwardRefParts,
    'no-render-clock': noRenderClock,
  },
};

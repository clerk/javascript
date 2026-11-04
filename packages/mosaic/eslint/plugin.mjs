import { forwardRefParts, noDynamicMessageCatalogs, noModelReactState, noRawInvoke } from './rules.mjs';

export default {
  rules: {
    'no-model-react-state': noModelReactState,
    'no-dynamic-message-catalogs': noDynamicMessageCatalogs,
    'forward-ref-parts': forwardRefParts,
    'no-raw-invoke': noRawInvoke,
  },
};

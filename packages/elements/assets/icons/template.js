// Fixes unused variable build error
const template = (variables, { tpl }) => {
  return tpl`
import type { Ref, SVGProps } from 'react';
import { forwardRef } from 'react';

${variables.interfaces};

const ${variables.componentName} = (${variables.props}) => (
  ${variables.jsx}
);

${variables.exports};
`;
};

module.exports = template;

import { type Component } from 'vue';

export const isThatComponent = (v: any, component: Component): v is Component => {
  return !!v && isRenderFunction(v) && v.name === component.name;
};

const isRenderFunction = (v: any): v is Component => {
  return 'name' in v && 'setup' in v;
};

import { isomorphicAtob } from '@clerk/shared/isomorphicAtob';
import { isomorphicBtoa } from '@clerk/shared/isomorphicBtoa';

if (!global.btoa) {
  global.btoa = isomorphicBtoa;
}

if (!global.atob) {
  global.atob = isomorphicAtob;
}

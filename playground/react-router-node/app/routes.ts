import {
  type RouteConfig,
  route,
  index,
} from "@react-router/dev/routes";

export default [
  index('./routes/index.tsx'),
  route('/sign-in/*', './routes/sign-in.tsx'),
  route('/sign-up/*', './routes/sign-up.tsx'),
  route('/protected', './routes/protected.tsx'),
] satisfies RouteConfig
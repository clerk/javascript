import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route('sign-in/*', 'routes/sign-in.tsx'),
  route('sign-up/*', 'routes/sign-up.tsx'),
  route('profile', 'routes/profile.tsx'),
  route('profile-form', 'routes/profile-form.tsx'),
  route('use-auth', 'routes/use-auth.tsx'),
  route('use-user', 'routes/use-user.tsx'),
] satisfies RouteConfig;

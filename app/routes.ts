import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route('sign-in/*', 'routes/sign-in.tsx')] satisfies RouteConfig;

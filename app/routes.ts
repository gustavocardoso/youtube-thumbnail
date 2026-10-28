import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("api/convert", "routes/api.convert.ts")] satisfies RouteConfig;

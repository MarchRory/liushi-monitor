import { RouteObject, createBrowserRouter } from "react-router-dom";
import App from "../App";

// export type AdminRouterItem = RouteObject & {
//   // set antd menu props in meta
//   meta?: MenuItemType;
//   children?: AdminRouterItem[];
// };

/**
 * auto load route from views/***\/*.router.ts
 * @returns route
 */
const loadRouteModules = async () => {
  const routeModuleFiles = import.meta.glob("../views/**/*.router.tsx", {
    eager: true,
    import: "default",
  });
  const routeModules: RouteObject[] = [];

  for await (const [_, module] of Object.entries(routeModuleFiles)) {
    // @ts-ignore
    if (module && module[0] && !module[0].meta.public) {
      const routes = Array.isArray(module) ? module : [module];
      routeModules.push(...routes);
    }
  }

  return routeModules;
};

const LoginRoute = (
  Object.values(
    import.meta.glob("../views/public/login/login.router.tsx", {
      eager: true,
      import: "default",
    }),
  )[0] as RouteObject[]
)[0];

export const routes: RouteObject[] = [...(await loadRouteModules())];

export default createBrowserRouter([
  LoginRoute,
  {
    path: "/",
    element: <App />,
    children: routes,
  },
]);

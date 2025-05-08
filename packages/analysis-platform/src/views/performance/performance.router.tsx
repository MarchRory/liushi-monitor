import { RouteObject } from "react-router-dom";
import PerformanceDashBoard from ".";
import { IUserTypeEnum } from "../../apis/user/types";
import FirstScreenDashboard from "./firstScreen";
import HttpPerformanceDashBoard from "./httpOverview";
import SpaPageOverview from "./spaPageOverview";

const performanceRoutes: RouteObject[] = [
  {
    path: "performance",
    element: <PerformanceDashBoard />,
    meta: {
      auth: IUserTypeEnum.ENGINEER,
      label: "线上性能监控",
      title: "线上性能监控",
      key: "/performance",
    },
    children: [
      {
        path: "page",
        element: <FirstScreenDashboard />,
        meta: {
          auth: IUserTypeEnum.ENGINEER,
          label: "首屏性能监控",
          title: "首屏性能监控",
          key: "/performance/page",
        },
      },
      {
        path: "spa",
        element: <SpaPageOverview />,
        meta: {
          auth: IUserTypeEnum.ENGINEER,
          label: "SPA页面加载总览",
          title: "SPA页面加载总览",
          key: "/performance/spa",
        },
      },
      {
        path: "http/overview",
        element: <HttpPerformanceDashBoard />,
        meta: {
          auth: IUserTypeEnum.ENGINEER,
          label: "接口请求监控",
          title: "接口请求监控",
          key: "/performance/http/overview",
        },
      },
    ],
  },
];

export default performanceRoutes;

import { RouteObject } from "react-router-dom";
import { IUserTypeEnum } from "../../apis/user/types";
import ErrorDashboard from "./index";
import ErrorOverview from "./errorOverview";

const performanceRoutes: RouteObject[] = [
  {
    path: "error",
    element: <ErrorDashboard />,
    meta: {
      auth: IUserTypeEnum.ENGINEER,
      label: "线上报错监控",
      title: "线上报错监控",
      key: "/error",
    },
    children: [
      {
        path: "overview",
        element: <ErrorOverview />,
        meta: {
          auth: IUserTypeEnum.ENGINEER,
          label: "数据总览",
          title: "数据总览",
          key: "/error/overview",
        },
      },
    ],
  },
];

export default performanceRoutes;

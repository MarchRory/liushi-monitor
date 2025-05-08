import { RouteObject } from "react-router-dom";
import { IUserTypeEnum } from "../../apis/user/types";
import UserBehaviorDashboard from "./index";
import UserBehaviorOverview from "./overview";

const performanceRoutes: RouteObject[] = [
  {
    path: "userbehavior",
    element: <UserBehaviorDashboard />,
    meta: {
      auth: IUserTypeEnum.OPERATOR,
      label: "用户行为监控",
      title: "用户行为监控",
      key: "/userbehavior",
    },
    children: [
      {
        path: "overview",
        element: <UserBehaviorOverview />,
        meta: {
          auth: IUserTypeEnum.OPERATOR,
          label: "数据总览",
          title: "数据总览",
          key: "/userbehavior/overview",
        },
      },
    ],
  },
];

export default performanceRoutes;

import { RouteObject } from "react-router-dom";
import { IUserTypeEnum } from "../../apis/user/types";
import TrackingPage from "./index";
import EventMgmt from "./eventMgmt";
import ComponentMgmt from "./componentMgmt";

const userMgmtRoutes: RouteObject[] = [
  {
    path: "track",
    element: <TrackingPage />,
    meta: {
      auth: IUserTypeEnum.ADMIN,
      label: "埋点管理",
      title: "埋点管理",
      key: "/track",
    },
    children: [
      {
        path: "event",
        element: <EventMgmt />,
        meta: {
          auth: IUserTypeEnum.ADMIN,
          key: "/track/event",
          label: "埋点事件",
          title: "埋点事件",
        },
      },
      {
        path: "component",
        element: <ComponentMgmt />,
        meta: {
          key: "/track/component",
          auth: IUserTypeEnum.ADMIN,
          label: "监控组件",
          title: "监控组件",
        },
      },
    ],
  },
];

export default userMgmtRoutes;

import { RouteObject } from "react-router-dom";
import { IUserTypeEnum } from "../../apis/user/types";
import TrackingPage from "./index";
import EventMgmt from "./children/eventMgmt";
import ComponentMgmt from "./children/componentMgmt";

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
          label: "事件管理",
          title: "事件管理",
        },
      },
      {
        path: "component",
        element: <ComponentMgmt />,
        meta: {
          key: "/track/component",
          auth: IUserTypeEnum.ADMIN,
          label: "组件管理",
          title: "组件管理",
        },
      },
    ],
  },
];

export default userMgmtRoutes;

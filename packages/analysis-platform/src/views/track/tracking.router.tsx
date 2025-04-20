import { RouteObject } from "react-router-dom";
import { IUserTypeEnum } from "../../apis/user/types";
import TrackingPage from "./index";
import EventMgmt from "./eventMgmt";
import ComponentTypeMgmt from "./componentTypeMgmt";
import ComponentMgmt from "./componentMgmt";
import IndicatorMgmt from "./indicatorMgmt";

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
          label: "监控事件大类",
          title: "监控事件大类",
        },
      },
      {
        path: "indicator",
        element: <IndicatorMgmt />,
        meta: {
          auth: IUserTypeEnum.ADMIN,
          key: "/track/indicator",
          label: "具体监控指标",
          title: "具体监控指标",
        },
      },
      {
        path: "componentType",
        element: <ComponentTypeMgmt />,
        meta: {
          key: "/track/componentType",
          auth: IUserTypeEnum.ADMIN,
          label: "监控组件大类",
          title: "监控组件大类",
        },
      },
      {
        path: "component",
        element: <ComponentMgmt />,
        meta: {
          key: "/track/component",
          auth: IUserTypeEnum.ADMIN,
          label: "具体组件监控",
          title: "具体组件监控",
        },
      },
    ],
  },
];

export default userMgmtRoutes;

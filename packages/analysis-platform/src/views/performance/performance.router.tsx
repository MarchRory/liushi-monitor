import { RouteObject } from "react-router-dom";
import PerformanceDashBoard from ".";
import { IUserTypeEnum } from "../../apis/user/types";

const performanceRoutes: RouteObject[] = [
  {
    path: "performance",
    element: <PerformanceDashBoard />,
    meta: {
      auth: IUserTypeEnum.ENGINEER,
      label: "性能大盘",
      title: "性能大盘",
      key: "/performance",
    },
  },
];

export default performanceRoutes;

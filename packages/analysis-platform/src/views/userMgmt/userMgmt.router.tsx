import DemoPage from "./index";
import { AdminRouterItem } from "../../router";
import { IUserTypeEnum } from "../../apis/user/types";

const userMgmtRoutes: AdminRouterItem[] = [
  {
    path: "user",
    element: <DemoPage />,
    meta: {
      auth: IUserTypeEnum.ADMIN,
      label: "用户管理",
      title: "用户管理",
      key: "/user",
    },
  },
];

export default userMgmtRoutes;

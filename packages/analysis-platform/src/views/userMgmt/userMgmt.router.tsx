import UserMgmtPage from "./index";
import { IUserTypeEnum } from "../../apis/user/types";
import { RouteObject } from "react-router-dom";

const userMgmtRoutes: RouteObject[] = [
  {
    path: "user",
    element: <UserMgmtPage />,
    meta: {
      auth: IUserTypeEnum.ADMIN,
      label: "用户管理",
      title: "用户管理",
      key: "/user",
    },
  },
];

export default userMgmtRoutes;

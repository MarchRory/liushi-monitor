import { IUserTypeEnum } from "../../apis/user/types";
import { AdminRouterItem } from "../../router";
import LoginPage from "./page";

const LoginRoute: AdminRouterItem = {
  path: "/",
  element: <LoginPage />,
  meta: {
    title: "登录页",
    label: "",
    key: "/login",
    auth: IUserTypeEnum.ADMIN,
  },
};

export default LoginRoute;

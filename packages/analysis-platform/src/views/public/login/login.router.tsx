import { RouteObject } from "react-router-dom";
import LoginPage from "./page";

const LoginRoute: RouteObject[] = [
  {
    path: "/",
    element: <LoginPage />,
    meta: {
      public: true,
      title: "登录",
      label: "登录",
      key: "/login",
    },
  },
];

export default LoginRoute;

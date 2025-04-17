import DemoPage from "./index";
import DemoChart from "./chart";
import DemoTable from "./table";
import { Outlet, RouteObject } from "react-router-dom";
import { IUserTypeEnum } from "../../apis/user/types";

const userMgmtRoutes: RouteObject[] = [
  {
    path: "demo",
    element: <DemoPage />,
    meta: {
      auth: IUserTypeEnum.ADMIN,
      label: "demo",
      title: "Dem",
      key: "/demo",
    },
    children: [
      {
        path: "chart",
        element: <DemoChart />,
        meta: {
          auth: IUserTypeEnum.ADMIN,
          label: "chart",
          title: "chart",
          key: "/demo/chart",
        },
      },
      {
        path: "table",
        element: <DemoTable />,
        meta: {
          auth: IUserTypeEnum.ADMIN,
          label: "table",
          title: "table",
          key: "/demo/table",
        },
      },
      {
        path: "nested",
        element: <Outlet />,
        meta: {
          auth: IUserTypeEnum.ADMIN,
          label: "nested",
          title: "nested",
          key: "/demo/nested",
        },
        children: [
          {
            path: "table",
            element: <DemoTable />,
            meta: {
              auth: IUserTypeEnum.ADMIN,
              label: "table",
              title: "table",
              key: "/demo/nested/table",
            },
          },
        ],
      },
    ],
  },
];

export default userMgmtRoutes;

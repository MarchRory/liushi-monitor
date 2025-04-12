import DemoPage from "./index";
import { AdminRouterItem } from "../../router";
import DemoChart from "./chart";
import DemoTable from "./table";
import { Outlet } from "react-router-dom";

const demoRoutes: AdminRouterItem[] = [
  // {
  //   path: "demo",
  //   element: <DemoPage />,
  //   meta: {
  //     label: "Demo",
  //     title: "Demo",
  //     key: "/demo",
  //   },
  //   children: [
  //     {
  //       path: "chart",
  //       element: <DemoChart />,
  //       meta: {
  //         label: "chart",
  //         title: "chart",
  //         key: "/demo/chart",
  //       },
  //     },
  //     {
  //       path: "table",
  //       element: <DemoTable />,
  //       meta: {
  //         label: "table",
  //         title: "table",
  //         key: "/demo/table",
  //       },
  //     },
  //     {
  //       path: "nested",
  //       element: <Outlet />,
  //       meta: {
  //         label: "nested",
  //         title: "nested",
  //         key: "/demo/nested",
  //       },
  //       children: [
  //         {
  //           path: "table",
  //           element: <DemoTable />,
  //           meta: {
  //             label: "table",
  //             title: "table",
  //             key: "/demo/nested/table",
  //           },
  //         },
  //       ],
  //     },
  //   ],
  // },
];

export default demoRoutes;

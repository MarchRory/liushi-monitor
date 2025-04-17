import FormPage from ".";
import { Outlet, RouteObject } from "react-router-dom";
import CallendarCmp from "./components/calendar";

const demoRoutes: RouteObject[] = [
  // {
  //   path: "form",
  //   element: <FormPage />,
  //   meta: {
  //     label: "Form",
  //     title: "Form",
  //     key: "/form",
  //   },
  // },
  // {
  //   path: "form2",
  //   element: <Outlet />,
  //   meta: {
  //     label: "Form2",
  //     title: "Form2",
  //     key: "/form2",
  //   },
  //   children: [
  //     {
  //       path: "callendar",
  //       element: <CallendarCmp />,
  //       meta: {
  //         label: "Callendar",
  //         title: "Callendar",
  //         key: "/form2/callendar",
  //       },
  //     },
  //   ],
  // },
];

export default demoRoutes;

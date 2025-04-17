import { Breadcrumb } from "antd";
import { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useEffect, useState } from "react";
import { RouteObject, useMatches } from "react-router-dom";
import { assign } from "lodash-es";
import useUserStore from "../store/user";

const flattenRoutes = (routes: RouteObject[], prefix = "/") => {
  let map: {
    [key: string]: {
      path: string;
      title: string;
    };
  } = {};

  routes.map((itm) => {
    if (!itm.meta?.title || !itm.path) return null;
    map[prefix + itm.path] = {
      path: prefix + itm.path,
      title: itm.meta.title,
    };

    if (itm.children) {
      map = assign(
        {},
        map,
        flattenRoutes(itm.children, prefix + itm.path + "/"),
      );
    }
  });

  return map;
};
type FlattenRoutesType = ReturnType<typeof flattenRoutes>;

const PageBreadcrumb: React.FC = () => {
  const { menu } = useUserStore((state) => ({
    menu: state.menu,
  }));
  const [flattendRoutes, setFlattendRoutes] = useState<FlattenRoutesType>(
    [] as unknown as FlattenRoutesType,
  );
  const matches = useMatches();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItemType[]>([]);

  useEffect(() => {
    setFlattendRoutes(flattenRoutes(menu));
  }, [menu]);

  useEffect(() => {
    setBreadcrumbs(
      matches.map((match) => {
        return {
          title: flattendRoutes[match.pathname]?.title,
        };
      }),
    );
  }, [matches]);

  return <Breadcrumb style={{ margin: "16px 20px" }} items={breadcrumbs} />;
};

export default PageBreadcrumb;

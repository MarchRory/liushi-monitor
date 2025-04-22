import { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate, RouteObject } from "react-router-dom";
import { IUserTypeEnum } from "../apis/user/types";
import { routes } from "../router";
import useUserStore from "../store/user";

const { Sider } = Layout;

const getMenuItems = (
  routes: RouteObject[],
  userType: IUserTypeEnum,
): any[] => {
  return routes
    .map((itm) => {
      if (
        !itm.meta ||
        (userType != IUserTypeEnum.ADMIN && userType != itm.meta.auth)
      )
        return null;
      let children = null;
      if (itm.children) children = getMenuItems(itm.children, userType);
      return children
        ? {
            ...itm.meta,
            children,
          }
        : {
            ...itm.meta,
            path: itm.path,
          };
    })
    .filter((itm) => !!itm);
};

/**
 * PageSidebar
 * @param props {autoCollapse?: boolean} automatic collapes menu when click another menu
 * @returns
 */
const PageSidebar = (props: { autoCollapse?: boolean }) => {
  const { user_type, menu, setMenu } = useUserStore((state) => ({
    user_type: state.userType,
    menu: state.menu,
    setMenu: state.setMenu,
  }));
  const { autoCollapse = true } = props;
  const navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [lastOpenedMenu, setLastOpenedMenu] = useState<string[]>([]);
  const location = useLocation();

  useEffect(() => {
    if (user_type === IUserTypeEnum.INITIAL) {
      setMenu([]);
    } else {
      const menuItems = getMenuItems(routes, user_type);
      setMenu(menuItems);
    }
  }, [user_type]);

  const onSwitchMenu = ({
    key,
    keyPath,
  }: {
    key: string;
    keyPath: string[];
  }) => {
    if (autoCollapse && keyPath.slice(1)) setLastOpenedMenu(keyPath.slice(1));
    navigate(key);
  };

  const onOpenChange = (openKeys: string[]) => {
    setLastOpenedMenu(openKeys);
  };

  useEffect(() => {
    setSelectedKeys([`${location.pathname}`]);
    navigate(location.pathname);
  }, [location.pathname]);

  return (
    <Sider theme="light">
      <Menu
        openKeys={lastOpenedMenu}
        onOpenChange={onOpenChange}
        selectedKeys={selectedKeys}
        mode="inline"
        items={menu}
        onClick={onSwitchMenu}
      />
    </Sider>
  );
};

export default PageSidebar;

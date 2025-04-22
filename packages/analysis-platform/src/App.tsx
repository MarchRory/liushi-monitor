import React, { useEffect } from "react";
import * as userApis from "./apis/user/index";
import PageLayout from "./layout";
import { ConfigProvider, message } from "antd";
import useConfigStore from "./store/config";
import { useNavigate } from "react-router-dom";
import LoginPage from "./views/public/login/page";
import useUserStore from "./store/user";
import { getHomePath } from "./utils/navigate";

const App: React.FC = () => {
  const theme = useConfigStore((state) => state.themeConfig);
  const [_, MessageCtxHolder] = message.useMessage();

  const { isLogin } = useUserStore((state) => ({ isLogin: state.isLogin }));
  const navigate = useNavigate();
  useEffect(() => {
    !isLogin && navigate("/", { replace: true });
  }, [isLogin]);

  const { setUserInfo } = useUserStore((state) => ({
    setUserInfo: state.setUserInfo,
  }));
  useEffect(() => {
    userApis.GetUserInfo().then(({ data }) => {
      setUserInfo(data);
      const targetPath = getHomePath(data.userType);
      targetPath && navigate(targetPath, { replace: true });
    });
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.algorithm,
        token: {
          colorPrimary: theme.primaryColor,
        },
      }}
      select={{
        style: {
          minWidth: 150,
        },
      }}
    >
      {MessageCtxHolder}
      {window.location.pathname === "/" ? <LoginPage /> : <PageLayout />}
    </ConfigProvider>
  );
};

export default App;

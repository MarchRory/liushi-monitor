import React, { useEffect } from "react";
import * as userApis from "./apis/user/index";
import PageLayout from "./layout";
import { ConfigProvider, message } from "antd";
import useConfigStore from "./store/config";
import { useNavigate } from "react-router-dom";
import LoginPage from "./views/public/login/page";
import useUserStore from "./store/user";

const App: React.FC = () => {
  const theme = useConfigStore((state) => state.themeConfig);
  const [_, MessageCtxHolder] = message.useMessage();

  const { isLogin } = useUserStore((state) => ({ isLogin: state.isLogin }));
  const navigate = useNavigate();
  useEffect(() => {
    !isLogin && navigate("/", { replace: true });
  }, [isLogin]);

  const setUserInfo = useUserStore((state) => state.setUserInfo);
  useEffect(() => {
    userApis.GetUserInfo().then(({ data }) => {
      setUserInfo(data);
      navigate("/user", { replace: true });
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
    >
      {MessageCtxHolder}
      {window.location.pathname === "/" ? <LoginPage /> : <PageLayout />}
    </ConfigProvider>
  );
};

export default App;

import React from "react";
import PageLayout from "./layout";
import { ConfigProvider, message } from "antd";
import useConfigStore from "./store/config";
import { useNavigate } from "react-router-dom";
import LoginPage from "./views/login/page";

const App: React.FC = () => {
  const theme = useConfigStore((state) => state.themeConfig);
  const [_, MessageCtxHolder] = message.useMessage();

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

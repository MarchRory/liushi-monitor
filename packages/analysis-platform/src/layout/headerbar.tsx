import { Layout, Switch, Button } from "antd";
import useConfigStore from "../store/config";
import useUserStore from "../store/user";
import { UserTypesMap } from "../apis/user/types";
import * as userApis from "../apis/user/index";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
const { Header } = Layout;

const Headerbar = (props: { colorBgContainer: string }) => {
  const setAlgorithm = useConfigStore((state) => state.setAlgorithm);
  const navigate = useNavigate();
  const setCompactAlgorithm = useConfigStore(
    (state) => state.setCompactAlgorithm,
  );
  const { user_name, user_type, logOut } = useUserStore((state) => ({
    user_name: state.user_name,
    user_type: state.user_type,
    logOut: state.clearAndLogout,
  }));

  const onLogout = useCallback(async () => {
    try {
      await userApis.Logout();
      navigate("/", { replace: true });
      logOut();
    } catch {}
  }, []);

  return (
    <Header
      title="React Admin Dashboard"
      style={{ padding: 0, background: props.colorBgContainer }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          padding: "0 20px",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Switch
            checkedChildren="Light"
            unCheckedChildren="Dark"
            defaultChecked
            onChange={(checked) => setAlgorithm(checked ? "default" : "dark")}
          />
          <Switch
            checkedChildren="Compact"
            unCheckedChildren="Loose"
            onChange={(checked) =>
              setCompactAlgorithm(checked ? "compact" : "")
            }
          />
          <p style={{ marginRight: 120 }}>
            {user_name} - {UserTypesMap[user_type]}
          </p>
          <Button onClick={onLogout} type="primary" color="red">
            退出登录
          </Button>
        </div>
      </div>
    </Header>
  );
};

export default Headerbar;

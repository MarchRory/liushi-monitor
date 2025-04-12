import { Layout, Switch } from "antd";
import useConfigStore from "../store/config";
const { Header } = Layout;

const Headerbar = (props: { colorBgContainer: string }) => {
  const setAlgorithm = useConfigStore((state) => state.setAlgorithm);
  const setCompactAlgorithm = useConfigStore(
    (state) => state.setCompactAlgorithm,
  );

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
          justifyContent: "space-between",
        }}
      >
        <h2>React Admin Dashboard</h2>
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
          <p style={{ marginRight: 10 }}>Yujian Xue</p>
        </div>
      </div>
    </Header>
  );
};

export default Headerbar;

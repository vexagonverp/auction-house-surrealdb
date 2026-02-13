import { Layout, Typography, Space, Tag } from "antd";
import {
  UserOutlined,
  WifiOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";

const { Header } = Layout;
const { Title } = Typography;

export const AppHeader = ({ connected, identity, screens }: any) => (
  <Header
    style={{
      display: "flex",
      flexDirection: screens.xs ? "column" : "row",
      alignItems: "center",
      justifyContent: screens.xs ? "center" : "space-between",
      padding: screens.xs ? "2px 16px" : "0 24px",
      background: "#001529",
      height: "auto",
      minHeight: 48,
    }}
  >
    <div
      style={{
        width: screens.xs ? "100%" : "auto",
        display: "flex",
        justifyContent: screens.xs ? "center" : "flex-start",
        marginBottom: screens.xs ? 2 : 0,
      }}
    >
      <Title level={4} style={{ color: "white", margin: 0 }}>
        Auction House
      </Title>
    </div>
    <Space
      wrap
      size={[6, 6]}
      style={{
        justifyContent: "center",
        width: screens.xs ? "100%" : "auto",
      }}
    >
      {connected ? (
        <Tag icon={<WifiOutlined />} color="success">
          Connected
        </Tag>
      ) : (
        <Tag icon={<DisconnectOutlined />} color="error">
          Disconnected
        </Tag>
      )}
      {identity && (
        <Tag icon={<UserOutlined />}>
          ID: {identity.toHexString().substring(0, 8)}
        </Tag>
      )}
    </Space>
  </Header>
);

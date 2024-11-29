import { Menu, Image } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

interface SidebarProps {
  collapsed: boolean;
  currentPath: string;
}

export default function Sidebar({ collapsed, currentPath }: SidebarProps) {
  const menuItems = [
    {
      key: "/dashboard/stores",
      icon: <AppstoreAddOutlined />,
      label: "商店管理",
    },
    {
      key: "/dashboard/users",
      icon: <UserOutlined />,
      label: "用户管理",
    },
    {
      key: "/dashboard/oplog",
      icon: <SettingOutlined />,
      label: "操作日志",
    },
  ];

  const router = useRouter();

  return (
    <>
      <div className="ml-4">
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={collapsed ? 180 : 48}
          height={collapsed ? 120 : 70}
          className="h-8 w-auto"
          preview={false}
        />
      </div>
      <Menu
        mode="inline"
        selectedKeys={[currentPath]}
        items={menuItems}
        theme="light"
        inlineCollapsed={collapsed}
        onClick={({ key }) => router.push(key)}
      />
    </>
  );
}

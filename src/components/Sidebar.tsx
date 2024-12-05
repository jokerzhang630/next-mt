import { Menu, Image } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";

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
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="h-full">
      <div className={`p-4 ${collapsed && !isMobile ? "text-center" : ""}`}>
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={collapsed && !isMobile ? 48 : 180}
          height={collapsed && !isMobile ? 48 : 120}
          className="h-8 w-auto"
          preview={false}
        />
      </div>
      <Menu
        mode="inline"
        selectedKeys={[currentPath]}
        items={menuItems}
        theme="light"
        inlineCollapsed={collapsed && !isMobile}
        onClick={({ key }) => {
          router.push(key);
          if (isMobile) {
            // 在移动端点击菜单项后关闭抽屉
            const event = new CustomEvent("closeSidebar");
            window.dispatchEvent(event);
          }
        }}
      />
    </div>
  );
}

import { useAuth } from "@/contexts/AuthContext";
import { usersAPI } from "@/services/api";
import { UserOutlined, BellOutlined, MenuOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Dropdown, Menu } from "antd";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>();
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    usersAPI.getServerTime().then((res) => {
      let serverTime = new Date(res.data.toString());
      setCurrentTime(serverTime.toLocaleString("zh-CN"));

      const timer = setInterval(() => {
        serverTime = new Date(serverTime.getTime() + 1000);
        setCurrentTime(serverTime.toLocaleString("zh-CN"));
      }, 1000);

      return () => clearInterval(timer);
    });
  }, []);

  const userMenu = (
    <Menu>
      <Menu.Item key="signout" onClick={signOut}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="flex items-center justify-between px-4 h-full text-gray-800">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <MenuOutlined className="text-xl" />
        </button>
      </div>

      {!isMobile && (
        <div className="text-center">
          <span className="text-sm font-medium">{currentTime}</span>
        </div>
      )}

      <div className="flex items-center space-x-4">
        {!isMobile && (
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <BellOutlined className="text-xl" />
          </button>
        )}

        <Dropdown overlay={userMenu} placement="bottomRight">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <UserOutlined />
            </div>
            {!isMobile && (
              <span className="text-sm font-medium">
                Admin: {user?.email || ""}
              </span>
            )}
          </div>
        </Dropdown>
      </div>
    </div>
  );
}

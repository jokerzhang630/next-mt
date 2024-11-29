import { useAuth } from "@/contexts/AuthContext";
import { UserOutlined, BellOutlined, MenuOutlined } from "@ant-design/icons";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="flex items-center justify-between text-white">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <MenuOutlined className="text-xl" />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <BellOutlined className="text-xl" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <UserOutlined />
          </div>
          <span className="text-sm font-medium">
            Admin:
            {user ? (
              <button onClick={signOut} className="text-blue-500">
                Sign Out
              </button>
            ) : (
              <a href="/login" className="text-blue-500">
                Sign In
              </a>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import "@/styles/globals.css";
import "antd/dist/reset.css";

// 添加 metadata 配置
export const metadata = {
  title: "Next-MT",
  description: "自动预约mt抽签系统",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#5c718f",
                colorInfo: "#5c718f",
              },
              components: {
                Layout: {
                  bodyBg: "white",
                  headerBg: "#5c718f",
                  headerHeight: 48,
                  siderBg: "white",
                  triggerBg: "#5c718f",
                },
              },
            }}
          >
            <AuthProvider>
              <AuthChecker>{children}</AuthChecker>
            </AuthProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
};

// 检查用户是否已登录
const AuthChecker = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        if (window.location.pathname !== "/login") {
          router.push("/login");
        }
      } else if (!window.location.pathname.startsWith("/dashboard")) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;

  return <>{children}</>;
};

export default RootLayout;

"use client";

import { ReactNode, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { Layout } from "antd";

const { Header, Sider, Content } = Layout;

const RootLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <html lang="en">
      <body>
        <Layout className="min-h-screen">
          <Layout>
            <Header className="p-0 bg-white">
              <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            </Header>
            <Layout>
              <Sider
                width={256}
                collapsible
                collapsed={!sidebarOpen}
                onCollapse={(collapsed) => setSidebarOpen(!collapsed)}
              >
                <Sidebar collapsed={sidebarOpen} currentPath={pathname} />
              </Sider>
              <Content className="m-6 bg-white">{children}</Content>
            </Layout>
          </Layout>
        </Layout>
      </body>
    </html>
  );
};

export default RootLayout;

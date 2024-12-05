"use client";

import { ReactNode, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { Layout, Drawer } from "antd";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const { Header, Sider, Content } = Layout;

const RootLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <html lang="en">
      <body>
        <Layout className="min-h-screen">
          <Layout>
            <Header className="p-0 bg-white">
              <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            </Header>
            <Layout>
              {isMobile ? (
                <Drawer
                  placement="left"
                  open={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                  styles={{ body: { padding: 0 } }}
                >
                  <Sidebar collapsed={false} currentPath={pathname} />
                </Drawer>
              ) : (
                <Sider
                  width={256}
                  collapsible
                  collapsed={!sidebarOpen}
                  onCollapse={(collapsed) => setSidebarOpen(!collapsed)}
                >
                  <Sidebar collapsed={!sidebarOpen} currentPath={pathname} />
                </Sider>
              )}
              <Content className="m-2 md:m-6 bg-white overflow-x-auto">
                {children}
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </body>
    </html>
  );
};

export default RootLayout;

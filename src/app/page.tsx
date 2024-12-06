// src/app/page.tsx

import { Spin } from "antd";

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <Spin tip="正在加载..." />
      </div>
    </>
  );
}

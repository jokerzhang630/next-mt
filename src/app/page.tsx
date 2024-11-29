// src/app/page.tsx

import { ServerInit } from "./components/ServerInit";

export default function HomePage() {
  return (
    <>
      <ServerInit />
      <div className="min-h-screen bg-gray-100">正在加载...</div>
    </>
  );
}

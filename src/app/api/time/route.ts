import { NextResponse } from "next/server";

export async function GET() {
  // 获取服务器时间
  const serverTime = new Date().toLocaleString("zh-CN");
  // 使用标准的返回格式
  return NextResponse.json(
    { success: true, data: serverTime },
    { status: 200 }
  );
}

import { NextResponse } from "next/server";
import { getServerTime } from "@/utils/dayjs";

export async function GET() {
  const formattedDate = getServerTime();
  console.log("formattedDate", formattedDate);
  // 获取服务器时间
  // 使用标准的返回格式
  return NextResponse.json(
    { success: true, data: formattedDate },
    { status: 200 }
  );
}

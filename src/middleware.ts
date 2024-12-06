import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from "./services/supabase";

export async function middleware(request: NextRequest) {
  // 检查是否是 API 路由
  if (request.nextUrl.pathname.startsWith("/api")) {
    // 排除不需要验证的路由
    const publicRoutes = [
      "/api/users/reserve",
      // 添加其他不需要验证的路由...
    ];
    console.log("middleware pathname", request.nextUrl.pathname);

    if (publicRoutes.includes(request.nextUrl.pathname)) {
      const authHeader = request.headers.get("Authorization");
      const apiSecret = process.env.API_SECRET;

      if (!authHeader || authHeader !== `Bearer ${apiSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.next();
    }

    try {
      // 获取并验证认证头
      const authHeader = request.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Invalid token format" },
          { status: 401 }
        );
      }
      const token = authHeader.split(" ")[1];
      // 验证会话
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      if (error || !user) {
        return NextResponse.json(
          { error: "No valid session" },
          { status: 401 }
        );
      }

      // 验证通过，继续处理请求
      const response = NextResponse.next();
      return response;
    } catch (error) {
      console.error("Auth error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  // 非 API 路由直接放行
  return NextResponse.next();
}

// 配置需要进行中间件处理的路径
export const config = {
  matcher: [
    // 匹配所有 API 路由
    "/api/:path*",
    // 排除不需要验证的路由
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};

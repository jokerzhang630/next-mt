import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from "@/app/api/superbase";
import type { PageResponse, OpLogResponse } from "@/types/globalTypes";
import axios from "axios";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const offset = (page - 1) * pageSize;

  try {
    // 获取总数
    const { count, error: countError } = await supabase
      .from("i_log")
      .select("*", { count: "exact", head: true });

    if (countError) {
      throw countError;
    }

    // 获取分页数据
    const { data, error } = await supabase
      .from("i_log")
      .select("*")
      .range(offset, offset + pageSize - 1)
      .order("log_id", { ascending: false });

    if (error) {
      throw error;
    }

    // 转换数据格式以匹配 OpLogResponse 接口
    const formattedData = data.map((log) => ({
      id: log.log_id,
      mobile: log.mobile,
      op_time:
        new Date(log.oper_time).toISOString().split("T")[0] +
        " " +
        new Date(log.oper_time).toISOString().split("T")[1].split(".")[0],
      status: log.status,
      log_content: log.log_content,
    }));

    const response: PageResponse<OpLogResponse> = {
      data: formattedData,
      total: count || 0,
      page: page,
      pageSize: pageSize,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("查询失败:", error);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { error } = await supabase.from("i_log").delete().neq("log_id", 0);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: "日志清除成功" }, { status: 200 });
  } catch (error) {
    console.error("清除日志失败:", error);
    return NextResponse.json({ error: "清除日志失败" }, { status: 500 });
  }
}

export async function POST() {
  const response = await axios.get(
    "https://www.drfans.com/api/sitemap/list?type=instantknow_datify&pageSize=10&pageNo=1",
    {
      headers: {
        Tenantid: "17",
      },
    }
  );
  console.log("response", response.data);
  return NextResponse.json(response.data);
}

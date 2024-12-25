import { supabase } from "@/app/api/superbase";
import axios from "axios";
import { getMTVersion, getItems, aesEncrypt } from "@/utils/sign";
import { insertOplog } from "@/app/components/OplogOperate";
import { NextResponse } from "next/server";
import { getServerHour, getServerMinute, getServerTime } from "@/utils/dayjs";

// 添加执行标记
let isRunning = false;

export async function GET() {
  try {
    const hour = getServerHour();
    // 检查时间是否在9-10点之间，且未在运行中
    if (hour < 9 || hour >= 10 || isRunning) {
      return NextResponse.json({ success: true, message: "已执行" });
    }
    // 设置运行标记
    isRunning = true;
    // 开始循环执行
    while (getServerHour() < 10) {
      await doUserReserve();
      // 等待到下一分钟
      await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
    }
    // 任务结束，关闭标记
    isRunning = false;
    return NextResponse.json({ success: true, message: "执行完成" });
  } catch (error) {
    // 发生错误时也要关闭标记
    isRunning = false;
    console.error("Cron job failed:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}

async function doUserReserve() {
  console.log("执行预约任务:", getServerTime());

  try {
    const currentMinute = getServerMinute();
    console.log("执行预约分钟数:", currentMinute);
    // 查询未过期的用户，匹配当前分钟数
    const { data: users, error } = await supabase
      .from("i_user")
      .select("*")
      .eq("random_minute", currentMinute)
      .gte("expire_time", new Date().toISOString());

    if (error) throw error;
    console.log("待执行的用户:", users);
    // 遍历用户执行预约
    for (const user of users) {
      if (!user.item_code) continue;

      const mtVersion = await getMTVersion();
      const itemResponse = await getItems();
      const itemCodes = JSON.parse(user.item_code);
      const shopId = user.ishop_id;

      // 遍历商品码执行预约
      for (const itemCode of itemCodes) {
        console.log("执行预约任务，用户：", user.mobile, "商品码：", itemCode);

        const requestData = {
          itemInfoList: [{ count: 1, itemId: itemCode }],
          sessionId: itemResponse.data.sessionId,
          userId: user.user_id.toString(),
          shopId,
        };

        const actParam = aesEncrypt(JSON.stringify(requestData));
        const realRequestData = { ...requestData, actParam };

        try {
          const response = await axios.post(
            "https://app.moutai519.com.cn/xhr/front/mall/reservation/add",
            realRequestData,
            {
              headers: {
                "MT-Lat": user.lat,
                "MT-Lng": user.lng,
                "MT-Token": user.token,
                "MT-Info": "028e7f96f6369cafe1d105579c5b9377",
                "MT-Device-ID": user.device_id,
                "MT-APP-Version": mtVersion,
                "User-Agent": "iOS;16.3;Apple;?unrecognized?",
                "Content-Type": "application/json",
                userId: user.user_id.toString(),
              },
            }
          );
          const result = `[预约项目]：${itemCode}[shopId]：${shopId}[结果返回]：${response.data.toString()}`;
          insertOplog(user.mobile, result, 1);
        } catch (error) {
          console.error(`用户 ${user.user_id} 预约失败:`, error);
          const result = `[预约失败]：${itemCode}[shopId]：${shopId}[结果返回]：${error}`;
          insertOplog(user.mobile, result, 0);
        }
      }
      // 随机生成新的分钟数 (0-50)
      const newRandomMinute = Math.floor(Math.random() * 51).toString();

      // 更新用户的 random_minute
      const { error: updateError } = await supabase
        .from("i_user")
        .update({ random_minute: newRandomMinute })
        .eq("mobile", user.mobile);

      if (updateError) {
        console.error(`用户 ${user.mobile} 更新随机分钟数失败:`, updateError);
      }
      // 线程休眠3秒
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  } catch (error) {
    console.error("预约任务执行失败:", error);
  }
}

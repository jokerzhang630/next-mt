import { CronJob } from "cron";
import { supabase } from "@/app/api/superbase";
import axios from "axios";
import { getMTVersion, getItems, aesEncrypt } from "@/utils/sign";
import { insertOplog } from "../components/OplogOperate";

export function initScheduler() {
  console.log("定时任务初始化...");

  // 修改 cron 表达式为：每天 9:00-10:00 每分钟执行一次
  const job = new CronJob("0 * 9 * * *", async () => {
    const currentHour = new Date().getHours();
    if (currentHour === 9) {
      await doUserReserve();
    }
  });

  job.start();
  console.log("定时任务已启动");
}

async function doUserReserve() {
  console.log("执行预约任务:", new Date().toLocaleString());

  try {
    const currentMinute = new Date().getMinutes().toString();

    // 查询未过期的用户，匹配当前分钟数
    const { data: users, error } = await supabase
      .from("i_user")
      .select("*")
      .eq("random_minute", currentMinute)
      .gt("expire_time", new Date().toISOString());

    if (error) throw error;

    // 遍历用户执行预约
    for (const user of users) {
      if (!user.item_code) continue;

      const mtVersion = await getMTVersion();
      const itemResponse = await getItems();
      const itemCodes = JSON.parse(user.item_code);
      const shopId = user.ishop_id;

      // 遍历商品码执行预约
      for (const itemCode of itemCodes) {
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

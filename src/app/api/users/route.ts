import { NextResponse } from "next/server";
import { supabase } from "@/app/api/superbase";
import { PageResponse, UserResponse } from "@/types/globalTypes";
import {
  generateSignature,
  getMTVersion,
  getItems,
  aesEncrypt,
} from "@/utils/sign";
import axios, { AxiosError } from "axios";
import { insertOplog } from "@/app/components/OplogOperate";

export async function GET(request: Request) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // 计算偏移量
    const offset = (page - 1) * pageSize;

    // 查询总数
    const { count } = await supabase
      .from("i_user")
      .select("*", { count: "exact", head: true });

    // 查询数据
    const { data, error } = await supabase
      .from("i_user")
      .select("*")
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw error;
    }

    const response: PageResponse<UserResponse> = {
      data: data as UserResponse[],
      page,
      pageSize,
      total: count || 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { phone, verificationCode, deviceId, projects, pickupStore } = body;

    const timestamp = Date.now();
    const mtVersion = await getMTVersion();

    const verifyResponse = await axios.post(
      "https://app.moutai519.com.cn/xhr/front/user/register/login",
      {
        mobile: phone,
        vCode: verificationCode,
        timestamp: timestamp.toString(),
        "MT-APP-Version": mtVersion,
        md5: generateSignature(phone + verificationCode, timestamp),
      },
      {
        headers: {
          "MT-Device-ID": deviceId,
          "MT-APP-Version": mtVersion,
          "User-Agent": "iOS;16.3;Apple;?unrecognized?",
          "Content-Type": "application/json",
        },
      }
    );

    const verifyData = verifyResponse.data;
    const pickupStoreData = JSON.parse(pickupStore);

    if (verifyData.code === 2000) {
      // 构建基础更新对象
      const updateData = {
        mobile: Number(phone),
        user_id: verifyData.data.userId,
        token: verifyData.data.token,
        cookie: verifyData.data.cookie,
        remark: verifyData.data.userName,
        device_id: deviceId,
        json_result: JSON.stringify(verifyData),
        expire_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      // 仅在 projects 存在时添加
      if (projects) {
        Object.assign(updateData, { item_code: projects });
      }

      // 仅在 pickupStoreData 存在时添加相关字段
      if (pickupStore) {
        Object.assign(updateData, {
          shop_id: pickupStoreData.shopId,
          province_name: pickupStoreData.province,
          city_name: pickupStoreData.cityName,
          full_address: pickupStoreData.fullAddress,
          lat: pickupStoreData.latitude,
          lng: pickupStoreData.longitude,
          shop_type: 2,
        });
      }

      // 更新数据库
      const { data, error } = await supabase
        .from("i_user")
        .upsert(updateData)
        .select();

      if (error) throw error;

      return NextResponse.json(data[0]);
    } else {
      return NextResponse.json(
        { error: "Verification failed", details: verifyData },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in user login:", error);
    return NextResponse.json(
      { error: "Failed to process login" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("body", body);
    const { user_id, ishop_id, item_code, token, device_id, lat, lng, mobile } =
      body;
    const mtVersion = await getMTVersion();
    console.log("mtVersion", mtVersion);
    const itemResponse = await getItems();
    console.log("itemResponse", itemResponse);
    // Create an array to store all reservation promises
    const reservationPromises = item_code.map(async (itemCode: string) => {
      const requestData = {
        itemInfoList: [{ count: 1, itemId: itemCode }],
        sessionId: itemResponse.data.sessionId,
        userId: user_id.toString(),
        shopId: ishop_id,
      };
      console.log("requestData", requestData);
      const actParam = aesEncrypt(JSON.stringify(requestData));
      console.log("actParam", actParam);
      const realRequestData = { ...requestData, actParam };
      console.log("realRequestData", realRequestData);

      try {
        const response = await axios.post(
          "https://app.moutai519.com.cn/xhr/front/mall/reservation/add",
          realRequestData,
          {
            headers: {
              "MT-Lat": lat,
              "MT-Lng": lng,
              "MT-Token": token,
              "MT-Info": "028e7f96f6369cafe1d105579c5b9377",
              "MT-Device-ID": device_id,
              "MT-APP-Version": mtVersion,
              "User-Agent": "iOS;16.3;Apple;?unrecognized?",
              "Content-Type": "application/json",
              userId: user_id.toString(),
            },
          }
        );

        console.log(`Reservation response for ${itemCode}:`, response.data);
        const result = `[预约项目]：${itemCode}[shopId]：${ishop_id}[结果返回]：${JSON.stringify(
          response.data
        )}`;
        await insertOplog(mobile, result, 1);
        return { success: true, itemCode, response: response.data };
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message || error.message
            : "Unknown error";
        console.error(`Error reserving ${itemCode}:`, errorMessage);
        const result = `[预约失败]：${itemCode}[shopId]：${ishop_id}[结果返回]：${errorMessage}`;
        await insertOplog(mobile, result, 0);
        return { success: false, itemCode, error: errorMessage };
      }
    });

    // Wait for all reservations to complete
    const results = await Promise.all(reservationPromises);

    // Check if any reservations were successful
    const hasSuccess = results.some((result) => result.success);

    return NextResponse.json({
      status: 200,
      data: {
        message: hasSuccess ? "部分或全部预约成功" : "所有预约均失败",
        code: hasSuccess ? 1000 : 500,
        results,
      },
    });
  } catch (error) {
    console.error("Error in reservation process:", error);
    return NextResponse.json({
      status: 500,
      data: {
        message:
          "预约处理失败:" +
          (error instanceof Error ? error.message : String(error)),
        code: 500,
      },
    });
  }
}

import { NextResponse } from "next/server";
import axios from "axios";

import { generateSignature } from "@/utils/sign";
import { getMTVersion } from "@/utils/sign";
import dayjs from "dayjs";

export async function POST(request: Request) {
  try {
    const { phone: mobile, deviceId: providedDeviceId } = await request.json();
    const timestamp = dayjs().valueOf();
    const deviceId = providedDeviceId;
    const data = {
      mobile,
      md5: generateSignature(mobile, timestamp),
      timestamp: timestamp.toString(),
    };

    const mtVersion = await getMTVersion();
    const response = await axios.post(
      "https://app.moutai519.com.cn/xhr/front/user/register/vcode",
      data,
      {
        headers: {
          "MT-Device-ID": deviceId,
          "MT-APP-Version": mtVersion,
          "User-Agent": "iOS;16.3;Apple;?unrecognized?",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.code === 2000) {
      return NextResponse.json({ success: true });
    } else {
      console.error("Send verification code failed:", response.data);
      return NextResponse.json({ error: "发送验证码错误" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error sending verification code:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

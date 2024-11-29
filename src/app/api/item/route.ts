import { NextResponse } from "next/server";
import { supabase } from "@/app/api/superbase";

export async function POST() {
  try {
    const dayTime = new Date().setHours(0, 0, 0, 0);

    // 请求茅台商城API
    const response = await fetch(
      `https://static.moutai519.com.cn/mt-backend/xhr/front/mall/index/session/get/${dayTime}`
    );
    const jsonData = await response.json();

    if (jsonData.code === 2000) {
      // 获取新的商品编码列表
      const newItemCodes = jsonData.data.itemList.map(
        (item: { itemCode: string }) => item.itemCode
      );

      // 获取数据库中现有的商品
      const { data: existingItems, error: fetchError } = await supabase
        .from("i_item")
        .select("item_code");
      console.log("existingItems", existingItems);
      if (fetchError) {
        console.log("fetchError", fetchError);
        throw fetchError;
      }

      // 找出需要删除的商品（在数据库中存在但不在新列表中的商品）
      const existingItemCodes = existingItems.map((item) => item.item_code);
      const itemsToDelete = existingItemCodes.filter(
        (code) => !newItemCodes.includes(code)
      );

      // 删除不再存在的商品
      if (itemsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("i_item")
          .delete()
          .in("item_code", itemsToDelete);

        if (deleteError) throw deleteError;
      }

      // 准备新的商品数据
      const itemsToUpsert = jsonData.data.itemList.map(
        (item: {
          itemCode: string;
          title: string;
          content: string;
          picture: string;
        }) => ({
          item_code: item.itemCode,
          title: item.title,
          content: item.content,
          picture: item.picture,
          create_time: new Date().toISOString(),
        })
      );
      console.log("itemsToUpsert", itemsToUpsert);

      // 使用 upsert 更新或插入商品数据
      const { error: upsertError } = await supabase
        .from("i_item")
        .upsert(itemsToUpsert, {
          onConflict: "item_code", // 以 itemCode 作为唯一标识
          ignoreDuplicates: false, // 更新重复记录
        });

      if (upsertError) throw upsertError;

      return NextResponse.json({
        success: true,
        message: "商品数据更新成功",
        stats: {
          deleted: itemsToDelete.length,
          upserted: itemsToUpsert.length,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "接口返回码错误" },
      { status: 400 }
    );
  } catch (error) {
    console.error("更新商品数据失败:", error);
    return NextResponse.json(
      { success: false, message: "更新商品数据失败" },
      { status: 500 }
    );
  }
}

// 添加内存缓存
let cacheData: {
  item_code: string;
  title: string;
  picture: string;
}[] = [];
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 10 * 60 * 1000; // 缓存5分钟

export async function GET() {
  // 检查缓存是否有效
  if (cacheData && Date.now() - cacheTime < CACHE_DURATION) {
    return new NextResponse(JSON.stringify({ data: cacheData }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300", // 5分钟的浏览器缓存
      },
    });
  }

  const { data: itemData, error } = await supabase.from("i_item").select("*");
  if (error) throw error;

  const data = itemData.map((item) => ({
    item_code: item.item_code,
    title: item.title,
    picture: item.picture,
  }));

  // 更新缓存
  cacheData = data;
  cacheTime = Date.now();

  return new NextResponse(JSON.stringify({ data }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300", // 5分钟的浏览器缓存
    },
  });
}

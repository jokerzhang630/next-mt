import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import axios from "axios";
import { supabase } from "@/app/api/superbase";
import type { PageResponse, StoreResponse } from "@/types/globalTypes";
import NodeCache from "node-cache";

// 创建缓存实例 (TTL: 5分钟)
const cache = new NodeCache({ stdTTL: 300 });

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const offset = (page - 1) * pageSize;
  const keyword = searchParams.get("keyword") || "";

  // 创建缓存键
  const cacheKey = `stores-${page}-${pageSize}-${searchParams.toString()}`;

  try {
    // 检查内存缓存
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          "Cache-Control": "public, max-age=300",
          "X-Cache-Key": cacheKey,
          "X-Cache-Hit": "true",
        },
      });
    }

    // 如果没有缓存，执行数据库查询
    const { count, error: countError } = await supabase
      .from("i_shop")
      .select("*", { count: "exact", head: true })
      .ilike("full_address", `%${keyword}%`);

    if (countError) {
      throw countError;
    }

    // 获取分页数据
    const { data, error } = await supabase
      .from("i_shop")
      .select("*")
      .ilike("full_address", `%${keyword}%`)
      .range(offset, offset + pageSize - 1)
      .order("shop_id", { ascending: true });

    if (error) {
      throw error;
    }

    // 转换数据格式以匹配 StoreResponse 接口
    const formattedData = data.map((store) => ({
      shopId: store.i_shop_id,
      province: store.province_name,
      cityName: store.city_name,
      district: store.district_name,
      fullAddress: store.full_address,
      latitude: store.lat,
      longitude: store.lng,
      name: store.name,
      companyName: store.tenant_name,
      createdAt: store.create_time,
    }));

    const response: PageResponse<StoreResponse> = {
      data: formattedData,
      total: count || 0,
      page: page,
      pageSize: pageSize,
    };

    // 存储到内存缓存
    cache.set(cacheKey, response);

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=300",
        "X-Cache-Key": cacheKey,
        "X-Cache-Hit": "false",
      },
    });
  } catch (error) {
    console.error("查询失败:", error);
    return NextResponse.json(
      { error: "查询失败" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

interface ExternalStore {
  [key: string]: {
    address: string;
    city: number;
    cityName: string;
    district: number;
    districtName: string;
    fullAddress: string;
    lat: number;
    layaway: boolean;
    lng: number;
    name: string;
    openEndTime: string;
    openStartTime: string;
    province: number;
    provinceName: string;
    shopId: string;
    tags: string[];
    tenantName: string;
  };
}

export async function POST() {
  try {
    // Step 1: Fetch initial data to get the shop URL
    const initialResponse = await axios.get(
      "https://static.moutai519.com.cn/mt-backend/xhr/front/mall/resource/get"
    );
    const initialData = initialResponse.data;

    // Extract shop URL
    const shopUrl = initialData.data.mtshops_pc.url;

    if (!shopUrl) {
      return NextResponse.json({ error: "未找到shopUrl" }, { status: 400 });
    }

    // Step 2: Fetch shop data from shopUrl
    const shopResponse = await axios.get(shopUrl);
    console.log("shopResponse", shopResponse);
    const shopData: ExternalStore = shopResponse.data;

    // Step 3: Prepare store records
    const shopIdSet = Object.keys(shopData);
    const storeRecords = shopIdSet.map((shopId) => {
      const shop = shopData[shopId];
      return {
        i_shop_id: shop.shopId,
        province_name: shop.provinceName || null,
        city_name: shop.cityName || null,
        district_name: shop.districtName || null,
        full_address: shop.fullAddress || null,
        lat: shop.lat || null,
        lng: shop.lng || null,
        name: shop.name || null,
        tenant_name: shop.tenantName || null,
        create_time: new Date().toISOString(),
      };
    });

    // Step 4: Use upsert instead of delete + insert
    const { error: upsertError } = await supabase
      .from("i_shop")
      .upsert(storeRecords, {
        onConflict: "i_shop_id", // Specify the unique column
        ignoreDuplicates: false,
      });

    if (upsertError) {
      console.error("Failed to update store records:", upsertError);
      return NextResponse.json({ error: "更新数据失败" }, { status: 500 });
    }

    // 成功更新数据后，清除所有缓存
    cache.flushAll();

    return NextResponse.json({ message: "数据刷新成功" }, { status: 200 });
  } catch (error) {
    console.error("刷新数据失败:", error);
    return NextResponse.json({ error: "刷新数据失败" }, { status: 500 });
  }
}

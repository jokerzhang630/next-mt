import axios from "axios";
import { supabase } from "@/services/supabase";
import type {
  ItemResponse,
  OpLogResponse,
  PageResponse,
  StoreResponse,
  UserResponse,
} from "@/types/globalTypes";

// 创建 axios 实例
const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 创建 Supabase 客户端

// 请求拦截器：添加认证信息
api.interceptors.request.use(async (config) => {
  // 对于特殊的公开路由，使用 API_SECRET
  if (config.url === "/users/reserve") {
    return config;
  }

  // 获取当前会话
  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log("interceptor session", session);

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 如果是 401 错误，可能需要重新登录
    if (error.response?.status === 401) {
      // 可以在这里处理登录过期的逻辑
      // 例如：重定向到登录页面
      // window.location.href = "/login";
    }
    console.error("API请求错误:", error);
    return Promise.reject(error);
  }
);

export const storesAPI = {
  getStores: (params: { page: number; pageSize: number; keyword?: string }) => {
    return api.get<StoreResponse, PageResponse<StoreResponse>>("/stores", {
      params,
    });
  },
  refresh: () => {
    return api.post("/stores");
  },
  refreshItem: () => {
    return api.post("/item");
  },
};

export const usersAPI = {
  getUsers: (params: { page: number; pageSize: number; keyword?: string }) => {
    return api.get<UserResponse, PageResponse<UserResponse>>("/users", {
      params,
    });
  },
  deleteUser: (id: string) => {
    return api.delete(`/users/${id}`);
  },
  addUser: (data: UserResponse) => {
    return api.put("/users", data);
  },
  reserveUser: (data: {
    user_id: string;
    ishop_id: string;
    item_code: string;
    token: string;
    device_id: string;
    lat: number;
    lng: number;
    mobile: string;
  }) => {
    return api.post("/users", data);
  },
  sendVerificationCode: (phone: string, deviceId: string) => {
    return api.post("/users/send", { phone, deviceId });
  },
  getItems: () => {
    return api.get<ItemResponse, { data: ItemResponse[] }>("/item");
  },
  refreshToken: (phone: string, deviceId: string) => {
    return api.post("/users/send", { phone, deviceId });
  },
  getOplogs: (params: { page: number; pageSize: number }) => {
    return api.get<OpLogResponse, PageResponse<OpLogResponse>>("/oplog", {
      params,
    });
  },
  clearOplogs: () => {
    return api.delete("/oplog");
  },
  getServerTime: () => {
    return api.get<{ serverTime: string }>("/time");
  },
};

export default api;

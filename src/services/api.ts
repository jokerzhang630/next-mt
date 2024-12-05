import axios from "axios";
import type {
  ItemResponse,
  OpLogResponse,
  PageResponse,
  StoreResponse,
  UserResponse,
} from "@/types/globalTypes";
// 创建axios实例
const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
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
  reserveUser: (data: UserResponse) => {
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

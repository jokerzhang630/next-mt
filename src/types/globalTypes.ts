export interface PageResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface UserResponse {
  mobile: string;
  user_id: string;
  token: string;
  item_code: string;
  province_name: string;
  city_name: string;
  expire_time: string;
  lat: number;
  lng: number;
  address: string;
  device_id: string;
  ishop_id: string;
}

export interface StoreResponse {
  shopId: string;
  province: string;
  cityName: string;
  district: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  name: string;
  companyName: string;
  createdAt: string;
}

export interface ItemResponse {
  item_code: string;
  title: string;
  picture: string;
}

export interface OpLogResponse {
  id: number;
  mobile: number;
  op_time: string;
  status: number;
  log_content: string;
}

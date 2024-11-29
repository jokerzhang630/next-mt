export interface IItem {
  /** id */
  itemId?: number;
  /** 预约商品编码 */
  itemCode?: string;
  /** 标题 */
  title?: string;
  /** 内容 */
  content?: string;
  /** 图片url */
  picture?: string;
  /** 创建时间 */
  createTime?: Date;
}

export interface ILog {
  /** 主键 */
  logId: number;
  /** 操作人员 */
  mobile?: number;
  /** 日志记录内容 */
  logContent?: string;
  /** 操作状态（0正常 1异常） */
  status?: number;
  /** 操作时间 */
  operTime?: Date;
  /** 创建用户 */
  createUser?: number;
}

export interface IShop {
  /** 商店ID */
  shopId: number;
  /** 商店编号 */
  iShopId?: string;
  /** 省份名称 */
  provinceName?: string;
  /** 城市名称 */
  cityName?: string;
  /** 区县名称 */
  districtName?: string;
  /** 完整地址 */
  fullAddress?: string;
  /** 纬度 */
  lat?: string;
  /** 经度 */
  lng?: string;
  /** 商店名称 */
  name?: string;
  /** 商店租户名称 */
  tenantName?: string;
  /** 创建时间 */
  createTime?: Date;
}

export interface IUser {
  /** 手机号 */
  mobile: number;
  /** 用户ID */
  userId?: number;
  /** 用户令牌 */
  token?: string;
  /** 用户Cookie */
  cookie?: string;
  /** 设备ID */
  deviceId?: string;
  /** 商品编码 */
  itemCode?: string;
  /** 商店ID */
  ishopId?: string;
  /** 省份名称 */
  provinceName?: string;
  /** 城市名称 */
  cityName?: string;
  /** 地址 */
  address?: string;
  /** 纬度 */
  lat?: string;
  /** 经度 */
  lng?: string;
  /** 分钟间隔 */
  minute?: number;
  /** 商店类型 */
  shopType?: number;
  /** 随机分钟 */
  randomMinute?: string;
  /** 推送令牌 */
  pushPlusToken?: string;
  /** JSON结果 */
  jsonResult?: string;
  /** 备注 */
  remark?: string;
  /** 过期时间 */
  expireTime?: Date;
  /** 删除标记 */
  delFlag?: boolean;
  /** 创建时间 */
  createTime?: Date;
  /** 创建用户 */
  createUser?: number;
  /** 更新时间 */
  updateTime?: Date;
  /** 更新用户 */
  updateUser?: number;
}

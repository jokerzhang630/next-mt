"use client";
import { Table, Input, Space, Card, Button, message } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { storesAPI } from "@/services/api";
const { Search } = Input;
import type { StoreResponse } from "@/types/globalTypes";

const StoresPage = () => {
  const columns = [
    {
      title: "店铺ID",
      dataIndex: "shopId",
      key: "shopId",
    },
    {
      title: "省份",
      dataIndex: "province",
      key: "province",
    },
    {
      title: "城市",
      dataIndex: "city_name",
      key: "city_name",
    },
    {
      title: "地区",
      dataIndex: "district",
      key: "district",
    },
    {
      title: "完整地址",
      dataIndex: "fullAddress",
      key: "fullAddress",
    },
    {
      title: "纬度",
      dataIndex: "latitude",
      key: "latitude",
    },
    {
      title: "经度",
      dataIndex: "longitude",
      key: "longitude",
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "公司名称",
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
    },
  ];

  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<StoreResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [refreshItemLoading, setRefreshItemLoading] = useState(false);

  const fetchStores = async (page: number, keyword: string = "") => {
    setLoading(true);
    try {
      const response = await storesAPI.getStores({
        page,
        pageSize: 10,
        keyword,
      });
      console.log("response", response);
      setTableData(response.data);
      setTotal(response.total); // Assuming the total is nested under the data property
    } catch (error) {
      console.error("获取门店数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshLoading(true);
    try {
      await storesAPI.refresh();
      message.success("刷新门店数据成功");
      await fetchStores(currentPage, searchKeyword);
    } catch (error) {
      console.error("刷新门店数据失败:", error);
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleRefreshItems = async () => {
    setRefreshItemLoading(true);
    try {
      await storesAPI.refreshItem();
      message.success("刷新商品数据成功");
    } catch (error) {
      console.error("刷新商品数据失败:", error);
    } finally {
      setRefreshItemLoading(false);
    }
  };

  useEffect(() => {
    fetchStores(1);
  }, []);

  return (
    <Card title="门店管理">
      <Space direction="vertical" style={{ width: "100%" }}>
        <Space>
          <Search
            placeholder="请输入搜索关键词"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={(value) => {
              setSearchKeyword(value);
              fetchStores(1, value);
            }}
          />
          <Button
            icon={<ReloadOutlined />}
            loading={refreshLoading}
            onClick={handleRefresh}
          >
            刷新门店
          </Button>
          <Button
            icon={<ReloadOutlined />}
            loading={refreshItemLoading}
            onClick={handleRefreshItems}
          >
            刷新商品
          </Button>
        </Space>
        <Table
          loading={loading}
          columns={columns}
          dataSource={tableData}
          scroll={{ x: 1500 }}
          pagination={{
            total: total,
            pageSize: 10,
            current: currentPage,
            onChange: (page) => {
              setCurrentPage(page);
              fetchStores(page, searchKeyword);
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default StoresPage;

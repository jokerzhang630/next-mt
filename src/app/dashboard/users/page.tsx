"use client";
import {
  Table,
  Input,
  Space,
  Card,
  Button,
  Modal,
  Form,
  message,
  Select,
  Image,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { storesAPI, usersAPI } from "@/services/api";
import { UserResponse } from "@/types/globalTypes";
import type { ColumnType } from "antd/es/table";
import React from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const UsersPage = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [messageApi, contextHolder] = message.useMessage();

  const [reserveLoading, setReserveLoading] = useState(false);

  const columns: ColumnType<UserResponse>[] = [
    {
      title: "手机号",
      dataIndex: "mobile",
      key: "mobile",
      fixed: isMobile ? false : true,
    },
    {
      title: "用户ID",
      dataIndex: "user_id",
      key: "user_id",
      responsive: ["md"],
    },
    {
      title: "Token",
      dataIndex: "token",
      key: "token",
      width: 100,
      ellipsis: {
        showTitle: true,
      },
      responsive: ["lg"],
      onCell: () => ({
        style: {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 100,
        },
      }),
    },
    {
      title: "预约项目",
      dataIndex: "item_code",
      key: "item_code",
      responsive: ["md"],
      width: 400,
      render: (codes: string) => {
        const codeArray = JSON.parse(codes);
        if (!codeArray || itemOptions.length === 0) {
          return "-";
        }
        return codeArray.map((code: string) => {
          const item = itemOptions.find((option) => option.value === code);
          return item ? item.label : code;
        });
      },
    },
    {
      title: "省份",
      dataIndex: "province_name",
      key: "province_name",
      width: 200,
      responsive: ["md"],
    },
    {
      title: "城市",
      dataIndex: "city_name",
      key: "city_name",
      width: 200,
      responsive: ["md"],
    },
    {
      title: "到期时间",
      dataIndex: "expire_time",
      key: "expire_time",
      responsive: ["md"],
      width: 200,
      render: (time: string) => {
        if (!time) return "-";
        return new Date(time)
          .toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .replace(/\//g, "-");
      },
    },
    {
      title: "操作",
      key: "action",
      fixed: isMobile ? false : "right",
      width: isMobile ? undefined : 300,
      render: (_: React.ReactNode, record: UserResponse) => (
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={reserveLoading}
            onClick={() => handleReserve(record)}
          >
            {!isMobile && "预约"}
          </Button>
          <Button
            type="primary"
            icon={<RedoOutlined />}
            onClick={() => handleRefreshToken(record)}
          >
            {!isMobile && "刷新token"}
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            {!isMobile && "删除"}
          </Button>
        </Space>
      ),
    },
  ];

  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<UserResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [addForm] = Form.useForm();
  const [itemOptions, setItemOptions] = useState<
    {
      value: string;
      label: React.ReactNode;
    }[]
  >([]);
  const [phoneValue, setPhoneValue] = useState("");
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [storeOptions, setStoreOptions] = useState<
    {
      value: string;
      label: React.ReactNode;
    }[]
  >([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<UserResponse | null>(null);
  const [isRefreshTokenModalVisible, setIsRefreshTokenModalVisible] =
    useState(false);
  const [refreshTokenForm] = Form.useForm();
  const [refreshTokenCountdown, setRefreshTokenCountdown] = useState(0);
  const [refreshTokenLoading, setRefreshTokenLoading] = useState(false);

  const fetchUsers = async (page: number, filters: object = {}) => {
    setLoading(true);
    try {
      const response = await usersAPI.getUsers({
        page,
        pageSize: 10,
        ...filters,
      });
      setTableData(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("获取用户数据失败:", error);
      messageApi.error("获取用户数据失败");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await usersAPI.getItems();
      const formattedOptions = response.data.map((item) => ({
        value: item.item_code,
        label: (
          <Space>
            <Image
              src={item.picture}
              alt={item.title}
              style={{ width: 30, height: 30, objectFit: "cover" }}
            />
            <span>{item.title}</span>
          </Space>
        ),
      }));
      setItemOptions(formattedOptions);
    } catch (error) {
      console.error("获取商品数据失败:", error);
      messageApi.error("获取商品数据失败");
    }
  };

  const fetchStores = async () => {
    const response = await storesAPI.getStores({
      page: 1,
      pageSize: Number.MAX_SAFE_INTEGER,
    });
    const formattedOptions = response.data.map((item) => ({
      value: JSON.stringify(item),
      label: item.name,
    }));
    setStoreOptions(formattedOptions);
  };

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    setCurrentPage(1);
    fetchUsers(1, values);
  };

  const handleAdd = () => {
    setIsModalVisible(true);
    addForm.resetFields();
  };

  // Add this new function
  function generateDeviceId(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  const handleSendCode = async () => {
    const phone = addForm.getFieldValue("phone");
    if (!phone) {
      messageApi.error("请输入手机号");
      return;
    }
    const deviceId = generateDeviceId();
    setDeviceId(deviceId);
    try {
      setSendCodeLoading(true);
      await usersAPI.sendVerificationCode(phone, deviceId);
      messageApi.success("验证码发送成功");
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("发送验证码失败:", error);
      messageApi.error("发送验证码失败");
    } finally {
      setSendCodeLoading(false);
    }
  };

  const handleAddSubmit = async () => {
    try {
      const values = await addForm.validateFields();
      console.log("values", values);

      await usersAPI.addUser({ ...values, deviceId });
      messageApi.success("添加成功");
      setIsModalVisible(false);
      fetchUsers(currentPage, searchForm.getFieldsValue());
    } catch (error) {
      messageApi.error("添加失败:" + error);
    }
  };

  const handleReserve = async (record: UserResponse) => {
    setReserveLoading(true);
    // 实现预约逻辑
    const response = await usersAPI.reserveUser(record);
    if (response.data.code !== 1000) {
      messageApi.error(response.data.message);
    } else {
      messageApi.success("预约成功，查看操作日志");
    }
    setReserveLoading(false);
  };

  const handleRefreshToken = (record: UserResponse) => {
    setCurrentRecord(record);
    setIsRefreshTokenModalVisible(true);
    refreshTokenForm.setFieldValue("phone", record.mobile);
  };

  const handleRefreshTokenSendCode = async () => {
    if (!currentRecord) return;

    try {
      setRefreshTokenLoading(true);
      await usersAPI.sendVerificationCode(
        currentRecord.mobile,
        currentRecord.divice_id
      );
      messageApi.success("验证码发送成功");
      setRefreshTokenCountdown(60);
      const timer = setInterval(() => {
        setRefreshTokenCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("发送验证码失败:", error);
      messageApi.error("发送验证码失败");
    } finally {
      setRefreshTokenLoading(false);
    }
  };

  const handleRefreshTokenSubmit = async () => {
    if (!currentRecord) return;

    try {
      const verificationCode = await refreshTokenForm.validateFields();
      await usersAPI.addUser({
        currentRecord,
        ...verificationCode,
      });
      messageApi.success("刷新token成功");
      setIsRefreshTokenModalVisible(false);
      fetchUsers(currentPage, searchForm.getFieldsValue());
    } catch (error) {
      messageApi.error("刷新token失败:" + error);
    }
  };

  const handleDelete = (record: UserResponse) => {
    setCurrentRecord(record);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentRecord) return;

    try {
      await usersAPI.deleteUser(currentRecord.mobile);
      messageApi.success("删除成功");
      fetchUsers(currentPage, searchForm.getFieldsValue());
    } catch (error) {
      console.error("删除失败:", error);
      messageApi.error("删除失败");
    } finally {
      setIsDeleteModalVisible(false);
      setCurrentRecord(null);
    }
  };

  const validatePhone = (phone: string) => {
    return /^1[3-9]\d{9}$/.test(phone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || validatePhone(value)) {
      setPhoneValue(value);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchItems().then(() => {
      fetchUsers(1);
    });
    fetchStores();
  }, []);

  return (
    <>
      {contextHolder}
      <Card title="预约用户管理" className="m-0 md:m-4">
        <Space direction="vertical" className="w-full">
          <Form
            form={searchForm}
            layout={isMobile ? "vertical" : "inline"}
            onFinish={handleSearch}
            className="w-full"
          >
            <Form.Item name="phone" className={isMobile ? "mb-2" : ""}>
              <Input placeholder="请输入手机号" />
            </Form.Item>
            <Form.Item name="userId" className={isMobile ? "mb-2" : ""}>
              <Input placeholder="请输入用户ID" />
            </Form.Item>
            <Form.Item className={isMobile ? "mb-2" : ""}>
              <Space wrap>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                >
                  搜索
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  新增
                </Button>
              </Space>
            </Form.Item>
          </Form>
          <Table
            columns={columns}
            dataSource={tableData}
            rowKey="id"
            loading={loading}
            scroll={{ x: true }}
            pagination={{
              total: total,
              pageSize: 10,
              current: currentPage,
              size: isMobile ? "small" : "default",
              onChange: (page) => {
                setCurrentPage(page);
                fetchUsers(page, searchForm.getFieldsValue());
              },
            }}
          />
        </Space>
        <Modal
          title="新增用户"
          open={isModalVisible}
          onOk={handleAddSubmit}
          onCancel={() => setIsModalVisible(false)}
        >
          <Form form={addForm} layout="vertical">
            <Form.Item
              name="pickupStore"
              label="提货门店"
              rules={[{ required: true, message: "请选择提货门店" }]}
            >
              <Select
                placeholder="请选择提货门店"
                options={storeOptions}
                style={{ width: "100%" }}
                showSearch
                optionLabelProp="label"
                filterOption={(inputValue, option) =>
                  (option?.label ?? "")
                    .toString()
                    .toLowerCase()
                    .includes(inputValue.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item
              name="projects"
              label="预约项目"
              rules={[{ required: true, message: "请选择预约项目" }]}
            >
              <Select
                mode="multiple"
                placeholder="请选择预约项目"
                options={itemOptions}
                style={{ width: "100%" }}
                optionLabelProp="label"
              />
            </Form.Item>
            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { required: true, message: "请输入手机号" },
                {
                  pattern: /^1[3-9]\d{9}$/,
                  message: "请输入正确的手机号格式",
                },
              ]}
            >
              <Input
                placeholder="请输入手机号"
                onChange={handlePhoneChange}
                maxLength={11}
              />
            </Form.Item>
            <Form.Item
              name="verificationCode"
              label="验证码"
              rules={[{ required: true, message: "请输入验证码" }]}
            >
              <Space>
                <Input placeholder="请输入验证码" />
                <Button
                  disabled={!phoneValue || countdown > 0}
                  loading={sendCodeLoading}
                  onClick={handleSendCode}
                >
                  {countdown > 0 ? `${countdown}秒后重试` : "发送验证码"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="确认删除"
          open={isDeleteModalVisible}
          onOk={handleDeleteConfirm}
          onCancel={() => setIsDeleteModalVisible(false)}
          okText="确定"
          cancelText="取消"
        >
          <p>确定要删除该用户吗？</p>
        </Modal>
        <Modal
          title="刷新Token"
          open={isRefreshTokenModalVisible}
          onOk={handleRefreshTokenSubmit}
          onCancel={() => setIsRefreshTokenModalVisible(false)}
          okText="确定"
          cancelText="取消"
        >
          <Form form={refreshTokenForm} layout="vertical">
            <Form.Item name="phone" label="手机号">
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="verificationCode"
              label="验证码"
              rules={[{ required: true, message: "请输入验证码" }]}
            >
              <Space>
                <Input placeholder="请输入验证码" />
                <Button
                  disabled={refreshTokenCountdown > 0}
                  loading={refreshTokenLoading}
                  onClick={handleRefreshTokenSendCode}
                >
                  {refreshTokenCountdown > 0
                    ? `${refreshTokenCountdown}秒后重试`
                    : "发送验证码"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </>
  );
};

export default UsersPage;

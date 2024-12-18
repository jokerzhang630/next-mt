"use client";

import { Button, Table, message } from "antd";
import { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { OpLogResponse } from "@/types/globalTypes";
import { usersAPI } from "@/services/api";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function OpLogPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [messageApi, contextHolder] = message.useMessage();
  const columns: ColumnsType<OpLogResponse> = [
    {
      title: "手机号",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "操作时间",
      dataIndex: "op_time",
      key: "op_time",
      responsive: ["md"],
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: number) => (status === 1 ? "成功" : "失败"),
    },
    {
      title: "日志内容",
      dataIndex: "log_content",
      key: "log_content",
      responsive: ["md"],
    },
  ];

  const [logs, setLogs] = useState<OpLogResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchLogs = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await usersAPI.getOplogs({ page, pageSize });
      setLogs(response.data);
      setPagination({
        ...pagination,
        current: page,
        total: response.total || 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      setClearLoading(true);
      await usersAPI.clearOplogs();
      messageApi.success("清理成功");
      fetchLogs();
    } finally {
      setClearLoading(false);
    }
  };
  const handlePost = async () => {
    await usersAPI.postOplog();
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <>
      {contextHolder}
      <div className="p-2 md:p-4">
        <div className="mb-4 flex justify-end">
          <Button
            type="primary"
            danger
            onClick={handleClear}
            loading={clearLoading}
            size={isMobile ? "small" : "middle"}
          >
            清理日志
          </Button>
          <Button
            type="primary"
            onClick={handlePost}
            size={isMobile ? "small" : "middle"}
          >
            刷新日志
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          scroll={{ x: true }}
          size={isMobile ? "small" : "middle"}
          pagination={{
            ...pagination,
            size: isMobile ? "small" : "default",
            onChange: (page, pageSize) => fetchLogs(page, pageSize),
          }}
        />
      </div>
    </>
  );
}

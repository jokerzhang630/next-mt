"use client";

import { Button, Table, message } from "antd";
import { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { OpLogResponse } from "@/types/globalTypes";
import { usersAPI } from "@/services/api";

export default function OpLogPage() {
  const [logs, setLogs] = useState<OpLogResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

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
    },
  ];

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
      message.success("清理成功");
      fetchLogs();
    } finally {
      setClearLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-end">
        <Button
          type="primary"
          danger
          onClick={handleClear}
          loading={clearLoading}
        >
          清理日志
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => fetchLogs(page, pageSize),
        }}
      />
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Card, Table, Tag, Progress } from "antd";
import { InterfaceUsage } from "../../../../apis/overview/type";

interface TopInterfacesTableProps {
  data: InterfaceUsage[];
}

const TopInterfacesTable: React.FC<TopInterfacesTableProps> = ({ data }) => {
  const [tableData, setTableData] = useState<
    (InterfaceUsage & { key: number })[]
  >([]);
  useEffect(() => {
    const newRenderedData = data.map((item, index) => ({
      ...item,
      key: index,
    }));
    setTableData(newRenderedData);
  }, [data]);
  // 准备表格列定义
  const columns = [
    {
      title: "接口路径",
      dataIndex: "interfaceUrl",
      key: "interfaceUrl",
      ellipsis: true,
      render: (text: string) => {
        // 提取接口基本路径
        const path = text.split("?")[0];
        return (
          <div className="text-xs md:text-sm truncate max-w-xs" title={text}>
            {path}
          </div>
        );
      },
    },
    {
      title: "调用次数",
      dataIndex: "count",
      key: "count",
      sorter: (a: InterfaceUsage, b: InterfaceUsage) => a.count - b.count,
      render: (count: number) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: "占比",
      dataIndex: "percentage",
      key: "percentage",
      sorter: (a: InterfaceUsage, b: InterfaceUsage) =>
        a.percentage - b.percentage,
      render: (percentage: number) => (
        <div className="w-full">
          <Progress
            percent={percentage}
            size="small"
            format={(percent) => `${percent}%`}
            strokeColor={{
              "0%": "#1677ff",
              "100%": "#52c41a",
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <Card title="接口调用占比" className="h-full" variant="borderless">
      <Table
        dataSource={tableData}
        columns={columns}
        pagination={false}
        size="small"
        scroll={{ y: 450 }}
      />
    </Card>
  );
};

export default TopInterfacesTable;

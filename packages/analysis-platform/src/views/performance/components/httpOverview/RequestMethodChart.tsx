import React, { useEffect, useMemo, useState } from "react";
import { Card } from "antd";
import { Pie, Options } from "@ant-design/charts";
import { MethodDistribution } from "../../../../apis/overview/type";

interface RequestMethodChartProps {
  data: MethodDistribution[];
}

interface ChartData {
  type: string;
  value: number;
  percentage: number;
}

const colorMap: Record<string, string> = {
  GET: "#1677ff",
  POST: "#52c41a",
  PUT: "#fa8c16",
  DELETE: "#ff4d4f",
  PATCH: "#722ed1",
  OPTIONS: "#13c2c2",
  HEAD: "#faad14",
};

function getChartConfig(data: ChartData[]): Options {
  return {
    data,
    angleField: "value",
    colorField: "type",
    radius: 0.75,
    color: (datum: any) => colorMap[datum.type] || "#8c8c8c",
    interactions: [{ type: "element-active" }],
    legend: {
      position: "right",
      layout: "vertical",
    },
    tooltip: {
      title: {
        field: "type",
      },
      items: [
        { name: "数量", field: "value" },
        { name: "占比", field: "percentage", valueFormatter: (v) => v + "%" },
      ],
    },
  };
}

const RequestMethodChart: React.FC<RequestMethodChartProps> = ({ data }) => {
  const [chartConfig, setChartOptions] = useState<Options>(() =>
    getChartConfig([]),
  );
  // 准备图表数据

  useEffect(() => {
    const newRenderedData = data.map((item) => ({
      type: item.method,
      value: item.count,
      percentage: item.percentage,
    }));
    const options = getChartConfig(newRenderedData);
    setChartOptions(options);
  }, [data]);

  return (
    <Card title="请求方法分布" className="h-full" variant="borderless">
      <div className="h-64">
        <Pie {...chartConfig} />
      </div>
    </Card>
  );
};

export default RequestMethodChart;

import React, { useEffect, useState } from "react";
import { Card } from "antd";
import { Options, Pie } from "@ant-design/charts";
import { StatusCodeDistribution } from "../../../../apis/overview/type";

interface StatusCodeChartProps {
  data: StatusCodeDistribution[];
}

interface IChartData {
  type: string;
  category: string;
  value: number;
  percentage: number;
  statusCode: number;
}

// 获取状态码类型
const getStatusCodeType = (code: number): string => {
  if (code >= 200 && code < 300) return "2xx 成功";
  if (code >= 300 && code < 400) return "3xx 重定向";
  if (code >= 400 && code < 500) return "4xx 客户端错误";
  if (code >= 500 && code < 600) return "5xx 服务器错误";
  return "其他";
};

// 获取颜色
const getStatusCodeColor = (code: number): string => {
  if (code >= 200 && code < 300) return "#52c41a";
  if (code >= 300 && code < 400) return "#1677ff";
  if (code >= 400 && code < 500) return "#faad14";
  if (code >= 500 && code < 600) return "#ff4d4f";
  return "#8c8c8c";
};

// 获取状态码详细描述
const getStatusCodeDescription = (code: number): string => {
  const descriptions: Record<number, string> = {
    200: "OK",
    201: "Created",
    204: "No Content",
    301: "Moved Permanently",
    302: "Found",
    304: "Not Modified",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    422: "Unprocessable Entity",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
  };
  return descriptions[code] || "Unknown";
};

function getChartOptions(data: IChartData[]): Options {
  return {
    data: data,
    angleField: "value",
    colorField: "statusCode",
    radius: 0.75,
    color: (datum: IChartData) => getStatusCodeColor(datum.statusCode),
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

const StatusCodeChart: React.FC<StatusCodeChartProps> = ({ data }) => {
  const [chartOptions, setChartOptions] = useState<Options>({});
  useEffect(() => {
    const newRenderedData = data.map((item) => ({
      type: `${item.statusCode} (${getStatusCodeDescription(item.statusCode)})`,
      category: getStatusCodeType(item.statusCode),
      value: item.count,
      percentage: item.percentage,
      statusCode: item.statusCode,
    }));
    const newOptions = getChartOptions(newRenderedData);
    setChartOptions(newOptions);
  }, [data]);

  // 图表配置

  return (
    <Card title="响应状态码分布" className="h-full" variant="borderless">
      <div className="h-64">
        <Pie {...chartOptions} />
      </div>
    </Card>
  );
};

export default StatusCodeChart;

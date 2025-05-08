import React, { useEffect, useState } from "react";
import { Card, Tooltip, Typography, Select, Empty, Skeleton, Tag } from "antd";
import {
  BaseChart,
  ECOption,
  getBaseLineOptions,
} from "../../../components/chart";
import { IPerformanceIndicatorChartData } from "../../../apis/chart/types";

const { Title, Text } = Typography;
const { Option } = Select;

interface FirstIndicatorChartSectionProps {
  title: string;
  chartData: IPerformanceIndicatorChartData | null;
  color: string;
  description: string;
}

const FirstIndicatorChartSection: React.FC<FirstIndicatorChartSectionProps> = ({
  title,
  description,
  chartData,
  color,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>("average");

  // 可视化指标选项
  const metricOptions = [
    { value: "average", label: "平均值" },
    { value: "median", label: "中位数" },
    { value: "p75", label: "75百分位" },
    { value: "p90", label: "90百分位" },
  ];

  // 准备图表数据
  const prepareChartData = () => {
    if (!chartData)
      return {
        timePoints: [],
        selectedData: [[]],
        count: 0,
      };

    const { timePoints, values, median, p75, p90, count } = chartData;

    let selectedData: (number | null)[] = values; // 默认使用平均值

    switch (selectedMetric) {
      case "median":
        selectedData = median || [];
        break;
      case "p75":
        selectedData = p75 || [];
        break;
      case "p90":
        selectedData = p90 || [];
        break;
      default:
        selectedData = values;
    }

    return {
      timePoints,
      selectedData: [selectedData],
      count,
    };
  };

  // 格式化显示的时间
  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const chartDataFormatted = prepareChartData();

  const [option, setOption] = useState<ECOption>(() =>
    getBaseLineOptions(
      chartDataFormatted?.timePoints,
      chartDataFormatted.selectedData,
    ),
  );
  useEffect(() => {
    const chartDataFormatted = prepareChartData();
    const newOptions = getBaseLineOptions(
      chartDataFormatted?.timePoints,
      chartDataFormatted.selectedData,
    );
    setOption(newOptions);
  }, [selectedMetric, chartData]);
  return (
    <Card
      className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
      style={{ padding: "16px 24px" }}
    >
      <div className="flex flex-col lg:flex-row">
        {/* 左侧指标信息 */}
        <div className="lg:w-1/4 pr-4 mb-4 lg:mb-0">
          <div className="flex items-center">
            <Title level={1} className="mb-2 text-gray-800 mr-2">
              {title}
            </Title>
          </div>

          <Text className="text-gray-300 block mb-4">{description}</Text>

          <div className="mt-4">
            <Text className="text-gray-700 font-medium mb-2 block">
              数据指标
            </Text>
            <Select
              value={selectedMetric}
              onChange={(value) => setSelectedMetric(value)}
              style={{ width: "100%" }}
              className="mb-4"
            >
              {metricOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>

          {chartData && (
            <div className="mt-4 bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <Text className="text-gray-600">样本总数</Text>
                <Text className="font-semibold">
                  {chartData.count?.reduce(
                    (sum, val) => (sum || 0) + (val || 0),
                    0,
                  )}
                </Text>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-gray-600">监测URL</Text>
                <Text
                  className="font-semibold text-xs truncate max-w-xs"
                  ellipsis={{ tooltip: chartData.url }}
                >
                  {chartData.url}
                </Text>
              </div>
            </div>
          )}
        </div>

        {/* 右侧图表 */}
        <div className="lg:w-3/4 lg:pl-6 border-l-0 lg:border-l border-gray-200">
          {!chartData && <Skeleton active paragraph={{ rows: 8 }} />}

          {chartData &&
          chartDataFormatted &&
          chartDataFormatted.timePoints.length > 0 ? (
            <div className="h-80">
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <BaseChart option={option} />
              </div>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
              <Empty description="暂无数据" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FirstIndicatorChartSection;

import React, { useState } from "react";
import { Card, Tabs, Radio, Tooltip, Empty } from "antd";
import { Line, Column, Heatmap } from "@ant-design/charts";
import { InfoCircleOutlined } from "@ant-design/icons";
import { UserBehaviorOverviewData } from "../../../apis/overview/type";

interface TimeAnalysisChartProps {
  data: UserBehaviorOverviewData["trends"];
  loading?: boolean;
}

interface ProcessedTimeData {
  timeKey: string;
  views: number;
  interactions: number;
  exposureAvg: number;
  count: number;
}

const TimeAnalysisChart: React.FC<TimeAnalysisChartProps> = ({
  data,
  loading,
}) => {
  const [timeUnit, setTimeUnit] = useState<"hour" | "day" | "week">("hour");

  // 处理数据，按照选择的时间单位进行聚合
  const processData = (): ProcessedTimeData[] => {
    if (!data || data.length === 0) return [];

    const result: ProcessedTimeData[] = [];
    const groupedData: Record<string, ProcessedTimeData> = {};

    data.forEach((item) => {
      let timeKey: string = "";
      const timestamp = new Date(item.timestamp);

      if (timeUnit === "hour") {
        timeKey = `${timestamp.getHours()}时`;
      } else if (timeUnit === "day") {
        timeKey = `周${
          ["日", "一", "二", "三", "四", "五", "六"][timestamp.getDay()]
        }`;
      } else if (timeUnit === "week") {
        timeKey =
          timestamp.getDate() <= 10
            ? "上旬"
            : timestamp.getDate() <= 20
              ? "中旬"
              : "下旬";
      }

      if (!groupedData[timeKey]) {
        groupedData[timeKey] = {
          timeKey,
          views: 0,
          interactions: 0,
          exposureAvg: 0,
          count: 0,
        };
      }

      groupedData[timeKey].views += item.views || 0;
      groupedData[timeKey].interactions += item.interactions || 0;
      groupedData[timeKey].exposureAvg += item.exposureAvg || 0;
      groupedData[timeKey].count += 1;
    });

    // 计算平均值
    Object.values(groupedData).forEach((group) => {
      if (group.count > 0) {
        group.exposureAvg = +(group.exposureAvg / group.count).toFixed(2);
      }
      result.push(group);
    });

    return result;
  };

  const processedData = processData();
  const hasData = processedData.length > 0;

  // 折线图数据转换
  const getLineData = () => {
    if (!hasData) return [];

    const result: Array<{
      timeKey: string;
      value: number;
      type: string;
    }> = [];

    processedData.forEach((item) => {
      result.push({
        timeKey: item.timeKey,
        value: item.views,
        type: "访问量",
      });

      result.push({
        timeKey: item.timeKey,
        value: item.interactions,
        type: "交互量",
      });

      result.push({
        timeKey: item.timeKey,
        value: item.exposureAvg,
        type: "平均曝光时长(秒)",
      });
    });

    return result;
  };

  // 折线图配置
  const lineConfig = {
    data: getLineData(),
    xField: "timeKey",
    yField: "value",
    seriesField: "type",
    smooth: true,
    animation: {
      appear: {
        animation: "wave-in",
        duration: 1000,
      },
    },
    legend: {
      position: "top-right",
    },
  };

  // 柱状图配置
  const columnConfig = {
    data: getLineData(),
    isGroup: true,
    xField: "timeKey",
    yField: "value",
    seriesField: "type",
    dodgePadding: 2,
    label: {
      position: "middle",
      layout: [
        { type: "interval-adjust-position" },
        { type: "interval-hide-overlap" },
        { type: "adjust-color" },
      ],
    },
    legend: {
      position: "top-right",
    },
  };

  // 热力图数据转换
  const getHeatmapData = () => {
    if (!hasData) return [];

    const heatmapData: Array<{
      timeKey: string;
      type: string;
      value: number;
    }> = [];

    processedData.forEach((item) => {
      heatmapData.push({
        timeKey: item.timeKey,
        type: "访问量",
        value: item.views,
      });
      heatmapData.push({
        timeKey: item.timeKey,
        type: "交互量",
        value: item.interactions,
      });
      heatmapData.push({
        timeKey: item.timeKey,
        type: "平均曝光",
        value: item.exposureAvg,
      });
    });

    return heatmapData;
  };

  // 热力图配置
  const heatmapConfig = {
    data: getHeatmapData(),
    xField: "timeKey",
    yField: "type",
    colorField: "value",
    color: ["#BAE7FF", "#1890FF", "#0050B3"],
    meta: {
      value: {
        alias: "数值",
      },
    },
    label: {
      style: {
        fill: "#fff",
        shadowBlur: 2,
        shadowColor: "rgba(0, 0, 0, .45)",
      },
    },
  };

  return (
    <Card loading={loading} className="shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-medium">时间分布分析</div>
        <div className="flex items-center">
          <Radio.Group
            value={timeUnit}
            onChange={(e) => setTimeUnit(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="hour">小时</Radio.Button>
            <Radio.Button value="day">星期</Radio.Button>
            <Radio.Button value="week">旬</Radio.Button>
          </Radio.Group>
          <Tooltip title="分析不同时间段的用户行为特征，帮助了解用户活跃规律">
            <InfoCircleOutlined className="ml-2 text-gray-400" />
          </Tooltip>
        </div>
      </div>

      {hasData ? (
        <Tabs
          items={[
            {
              key: "line",
              label: "趋势图",
              children: <Line {...lineConfig} />,
            },
            {
              key: "column",
              label: "柱状图",
              children: <Column {...columnConfig} />,
            },
            {
              key: "heatmap",
              label: "热力分布",
              children: <Heatmap {...heatmapConfig} />,
            },
          ]}
        />
      ) : (
        <Empty description="暂无时间分布数据" />
      )}
    </Card>
  );
};

export default TimeAnalysisChart;

import React from "react";
import { Card, Tabs, Empty } from "antd";
import { Pie, Bar, BarConfig, PieConfig } from "@ant-design/charts";
import { ExposureDepthData } from "../../../apis/overview/type";

interface ExposureDepthChartProps {
  data: ExposureDepthData;
  loading?: boolean;
}

const ExposureDepthChart: React.FC<ExposureDepthChartProps> = ({
  data,
  loading,
}) => {
  // 检查数据是否有效
  const hasDistributionData =
    data?.exposureDistribution && data.exposureDistribution.length > 0;
  const hasPathData = data?.pathAvgExposure && data.pathAvgExposure.length > 0;

  // 曝光时间分布配置
  const distributionConfig: PieConfig = {
    data: data?.exposureDistribution || [],
    angleField: "count",
    colorField: "time_range",
    radius: 0.8,
    interactions: [{ type: "element-active" }],
    tooltip: {
      items: [
        { name: "曝光时长", field: "time_range" },
        { name: "人次", field: "count" },
      ],
    },
    color: ({ time_range }: { time_range: string }) => {
      const colorMap: Record<string, string> = {
        "0-5秒": "#91CC75",
        "5-15秒": "#5470C6",
        "15-30秒": "#FAC858",
        "30-60秒": "#EE6666",
        "1-3分钟": "#73C0DE",
        "3-5分钟": "#3BA272",
        "5分钟以上": "#FC8452",
      };
      return colorMap[time_range] || "#1890FF";
    },
  };

  // 路径曝光时间配置
  const pathExposureConfig: BarConfig = {
    data: data?.pathAvgExposure || [],
    xField: "avgExposureTime",
    yField: "path",
    seriesField: "path",
    legend: { position: "top-right" },
    barBackground: { style: { fill: "rgba(0,0,0,0.1)" } },
    interactions: [{ type: "active-region", enable: false }],
    tooltip: {
      items: [
        { name: "曝光路径", field: "path" },
        { name: "平均曝光时长(秒)", field: "avgExposureTime" },
        { name: "访问人次", field: "count" },
      ],
    },
    // 限制显示的数据量，避免图表过于拥挤
    maxBarWidth: 40,
    minBarWidth: 10,
  };

  return (
    <Card loading={loading} className="shadow-sm">
      <div className="text-lg font-medium mb-4">曝光深度分析</div>
      <Tabs
        items={[
          {
            key: "distribution",
            label: "曝光时间分布",
            children: hasDistributionData ? (
              <Pie {...distributionConfig} />
            ) : (
              <Empty description="暂无曝光时间分布数据" />
            ),
          },
        ]}
      />
    </Card>
  );
};

export default ExposureDepthChart;

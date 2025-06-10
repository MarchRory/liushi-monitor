import React from "react";
import { Card, Tabs } from "antd";
import { Line, LineConfig } from "@ant-design/charts";

interface TrendData {
  timestamp: string;
  views: number;
  interactions: number;
  exposureAvg: number;
}

interface TrendChartProps {
  data: TrendData[];
  loading?: boolean;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, loading }) => {
  const getChartConfig = (
    dataKey: keyof TrendData,
    yName: string,
  ): LineConfig => ({
    data,
    xField: "timestamp",
    yField: dataKey,
    smooth: true,
    point: {
      size: 5,
      shape: "diamond",
    },
    label: {
      style: {
        fill: "#aaa",
      },
    },
    animation: {
      appear: {
        animation: "wave-in",
        duration: 1000,
      },
    },
    tooltip: {
      items: [
        { name: yName, field: dataKey },
        { name: "时间段", field: "timestamp" },
      ],
    },
  });

  return (
    <Card loading={loading} className="shadow-sm">
      <Tabs
        items={[
          {
            key: "views",
            label: "访问量趋势",
            children: <Line {...getChartConfig("views", "人次")} />,
          },
          {
            key: "exposureAvg",
            label: "曝光趋势",
            children: (
              <Line {...getChartConfig("exposureAvg", "平均曝光时间(秒)")} />
            ),
          },
        ]}
      />
    </Card>
  );
};

export default TrendChart;

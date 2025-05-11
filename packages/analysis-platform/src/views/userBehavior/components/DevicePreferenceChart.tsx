import React from "react";
import { Card, Tabs } from "antd";
import { Pie, Column, PieConfig, ColumnConfig } from "@ant-design/charts";
import { DevicePreferenceData } from "../../../apis/overview/type";

interface DevicePreferenceChartProps {
  data: DevicePreferenceData;
  loading?: boolean;
}

const DevicePreferenceChart: React.FC<DevicePreferenceChartProps> = ({
  data,
  loading,
}) => {
  // 设备类型分布配置
  const deviceTypeConfig: PieConfig = {
    data: data?.deviceTypeDistribution || [],
    angleField: "_count",
    colorField: "deviceType",
    radius: 0.8,
    interactions: [{ type: "element-active" }],
    legend: {
      position: "bottom",
      layout: "horizontal",
    },
    tooltip: {
      items: [
        { name: "设备类型", field: "deviceType" },
        { name: "数量", field: "_count" },
      ],
    },
  };

  // 浏览器分布配置
  const browserConfig: PieConfig = {
    data: data?.browserDistribution || [],
    angleField: "_count",
    colorField: "deviceBowserName",
    radius: 0.8,
    interactions: [{ type: "element-active" }],
    legend: {
      position: "bottom",
      layout: "horizontal",
    },
    tooltip: {
      items: [
        { name: "浏览器类型", field: "deviceBowserName" },
        { name: "数量", field: "_count" },
      ],
    },
  };

  // 操作系统分布配置
  const osConfig: PieConfig = {
    data: data?.osDistribution || [],
    angleField: "_count",
    colorField: "deviceOs",
    radius: 0.8,
    interactions: [{ type: "element-active" }],
    legend: {
      position: "bottom",
      layout: "horizontal",
    },
    tooltip: {
      items: [
        { name: "操作系统类型", field: "deviceOs" },
        { name: "数量", field: "_count" },
      ],
    },
  };

  // 设备曝光时间配置
  const exposureTimeConfig: ColumnConfig = {
    data: data?.deviceExposureTime || [],
    xField: "deviceType",
    yField: "avgExposureTime",
    label: {
      style: {
        fill: "#ffffff",
        opacity: 0.6,
      },
    },
    meta: {
      avgExposureTime: {
        alias: "平均曝光时间(秒)",
      },
    },
    tooltip: {
      items: [
        { name: "设备类型", field: "deviceType" },
        { name: "平均曝光时间（秒）", field: "avgExposureTime" },
      ],
    },
  };

  return (
    <Card loading={loading} className="shadow-sm">
      <div className="text-lg font-medium mb-4">设备偏好分析</div>
      <Tabs
        items={[
          {
            key: "deviceType",
            label: "设备类型分布",
            children: <Pie {...deviceTypeConfig} />,
          },
          {
            key: "browser",
            label: "浏览器分布",
            children: <Pie {...browserConfig} />,
          },
          {
            key: "os",
            label: "操作系统分布",
            children: <Pie {...osConfig} />,
          },
          {
            key: "exposureTime",
            label: "设备曝光时间",
            children: <Column {...exposureTimeConfig} />,
          },
        ]}
      />
    </Card>
  );
};

export default DevicePreferenceChart;

import React, { useEffect, useState } from "react";
import { Card } from "antd";
import { Column, Options } from "@ant-design/charts";
import { HourlyDistribution } from "../../../../apis/overview/type";

interface HourlyDistributionChartProps {
  data: HourlyDistribution[];
}

interface ChartData {
  hour: string;
  count: number;
  rawHour: string;
}

function getChartOptions(data: ChartData[]): Options {
  return {
    data,
    xField: "hour",
    yField: "count",
    color: "#55c9c9",
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: true,
      },
    },
    meta: {
      hour: {
        alias: "时间",
      },
      count: {
        alias: "请求数",
      },
    },
    tooltip: {
      title: {
        field: "hour",
      },
      items: [{ name: "整时段请求量", field: "count" }],
    },
    style: {
      radiusTopLeft: 10,
      radiusTopRight: 10,
    },
  };
}

const HourlyDistributionChart: React.FC<HourlyDistributionChartProps> = ({
  data,
}) => {
  // 格式化小时标签
  const formatHourLabel = (hourStr: string) => {
    try {
      const date = new Date(hourStr);
      return `${date.getHours()}:00`;
    } catch (e) {
      return hourStr;
    }
  };

  const [chartOptions, setChartOptions] = useState<Options>({});
  useEffect(() => {
    const newChartOptions = data.map((item) => ({
      hour: formatHourLabel(item.hour),
      count: item.count,
      rawHour: item.hour,
    }));
    const options = getChartOptions(newChartOptions);
    setChartOptions(options);
  }, [data]);

  return (
    <Card title="请求量时间分布" className="h-full" variant="borderless">
      <Column {...chartOptions} />
    </Card>
  );
};

export default HourlyDistributionChart;

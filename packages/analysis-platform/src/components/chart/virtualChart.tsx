import { useState, useEffect } from "react";
import { ICommonChartProps, ECOption } from "./echarts.config";
import { BaseChart } from "./baseChart";
import { cloneDeep } from "lodash-es";

interface VirtualizedEChartProps extends ICommonChartProps {
  dataSize: number;
  dataSizeThreshold?: number;
  sampleSize?: number;
}

export const VirtualizedEChart: React.FC<VirtualizedEChartProps> = ({
  option,
  dataSize,
  dataSizeThreshold = 10000,
  sampleSize = 1000,
  ...restProps
}) => {
  const [processedOption, setProcessedOption] = useState<ECOption>(option);

  useEffect(() => {
    if (dataSize > dataSizeThreshold) {
      const newOption = cloneDeep(option) as ECOption;

      // Apply optimization for large datasets
      if (newOption.series && Array.isArray(newOption.series)) {
        newOption.series = newOption.series.map((series) => {
          if (series.type === "line" || series.type === "bar") {
            return {
              ...series,
              progressive: 500, // 每一帧渲染500项数据
              progressiveThreshold: 3000,
              large: true,
              largeThreshold: 500, // Data more than 500 will be drawn in a different way
            };
          }
          return series;
        });
      }

      setProcessedOption(newOption);
    } else {
      setProcessedOption(option);
    }
  }, [option, dataSize, dataSizeThreshold, sampleSize]);

  return <BaseChart option={processedOption} {...restProps} />;
};

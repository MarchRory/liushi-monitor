import React, { useRef, useEffect, useState, useCallback } from "react";
import { echartsCore } from "./echarts.config";
import type { ECharts, ICommonChartProps } from "./echarts.config";
import { debounce } from "lodash-es";
import { Button, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const CommonChart: React.FC<ICommonChartProps> = ({
  option,
  loading = false,
  theme = "default",
  notMerge = false,
  lazyUpdate = false,
  showRefreshButton = true,
  refreshButtonPosition = "topRight",
  enableDataZoom = true,
  debounceTime = 300,
  onChartReady,
  onEvents,
  style = {},
  className = "",
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echartsCore.init(chartRef.current, theme);
    chartInstance.current = chart;

    if (
      enableDataZoom &&
      option &&
      option.series &&
      Array.isArray(option.series) &&
      option.series.length > 0
    ) {
      if (!option.dataZoom) {
        option.dataZoom = [
          {
            type: "inside",
            start: 0,
            end: 100,
          },
          {
            type: "slider",
            start: 0,
            end: 100,
          },
        ];
      }
    }

    chart.setOption(option, notMerge, lazyUpdate);

    if (onEvents && typeof onEvents === "object") {
      Object.keys(onEvents).forEach((eventName) => {
        // @ts-ignore
        chart.on(eventName, onEvents[eventName]);
      });
    }

    if (onChartReady && typeof onChartReady === "function") {
      onChartReady(chart);
    }

    return () => {
      if (chart) {
        chart.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  // Update chart option when option changes
  useEffect(() => {
    if (chartInstance.current && option) {
      // Don't update during resize to avoid flickering
      if (!isResizing) {
        const enhancedOption = { ...option };

        // Add data zoom if enabled
        if (
          enableDataZoom &&
          option.series &&
          Array.isArray(option.series) &&
          option.series.length > 0
        ) {
          if (!enhancedOption.dataZoom) {
            enhancedOption.dataZoom = [
              {
                type: "inside",
                start: 0,
                end: 100,
              },
              {
                type: "slider",
                start: 0,
                end: 100,
              },
            ];
          }
        }

        chartInstance.current.setOption(enhancedOption, notMerge, lazyUpdate);
      }
    }
  }, [option, notMerge, lazyUpdate, isResizing, enableDataZoom]);

  useEffect(() => {
    if (chartInstance.current) {
      loading
        ? chartInstance.current.showLoading()
        : chartInstance.current.hideLoading();
    }
  }, [loading]);

  const handleResize = useCallback(
    debounce(() => {
      if (chartInstance.current) {
        setIsResizing(true);
        chartInstance.current.resize();
        setIsResizing(false);
      }
    }, debounceTime),
    [debounceTime],
  );

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      handleResize.cancel();
    };
  }, [handleResize]);

  const handleRefresh = useCallback(() => {
    if (chartInstance.current) {
      chartInstance.current.clear();
      chartInstance.current.setOption(option, notMerge, lazyUpdate);
    }
  }, [option, notMerge, lazyUpdate]);

  const getRefreshButtonStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      zIndex: 10,
    };

    if (refreshButtonPosition === "topRight") {
      return {
        ...baseStyle,
        top: 10,
        right: 10,
      };
    } else {
      return {
        ...baseStyle,
        top: 10,
        left: 10,
      };
    }
  };

  return (
    <div
      className={`react-echarts-container ${className}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "300px",
        ...style,
      }}
    >
      {showRefreshButton && (
        <Tooltip title="Refresh Chart">
          <Button
            icon={<ReloadOutlined />}
            size="small"
            type="default"
            onClick={handleRefresh}
            style={getRefreshButtonStyle()}
          />
        </Tooltip>
      )}
      <div
        ref={chartRef}
        className="react-echarts"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export const BaseChart = React.memo(CommonChart);

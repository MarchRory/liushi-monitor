import React, { useState, useEffect } from "react";
import { DatePicker, Spin, Typography } from "antd";
import { RangePickerProps } from "antd/es/date-picker";
import dayjs from "dayjs";
import FirstIndicatorChartSection from "./components/firsrIndicatorChartSection";
import { getFirstScreenIndicatorChartData } from "../../apis/chart/index";
import {
  IPerformanceIndicatorChartData,
  PerformanceIndicatorName,
} from "../../apis/chart/types";
import useEventAndIndicatorsStore from "../../store/eventTypeAndIndicators";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const FirstScreenDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf("day"),
    dayjs(),
  ]);
  const { indicators, initEventAndIndicators } = useEventAndIndicatorsStore(
    (state) => ({
      initEventAndIndicators: state.init,
      indicators: state.indicatorList,
    }),
  );
  const [indicatorsCardConfig, setIndicatorsCardConfig] = useState<
    {
      name: PerformanceIndicatorName;
      id: number;
      title: string;
      description: string;
    }[]
  >([]);
  const [url, setUrl] = useState<string>(window.location.href);

  // 性能指标数据
  const [lcpData, setLcpData] = useState<IPerformanceIndicatorChartData | null>(
    null,
  );
  const [fpData, setFpData] = useState<IPerformanceIndicatorChartData | null>(
    null,
  );
  const [fcpData, setFcpData] = useState<IPerformanceIndicatorChartData | null>(
    null,
  );
  const [ttfbData, setTtfbData] =
    useState<IPerformanceIndicatorChartData | null>(null);

  // 指标配置信息
  useEffect(() => {
    if (indicators.length) {
      const target = new Set(["fp", "fcp", "lcp", "ttfb"]);
      const cardsConfig = [];
      for (const item of indicators) {
        const splitedNames = item.indicatorName.split("_");
        const name = splitedNames[splitedNames.length - 1];
        if (target.has(name)) {
          cardsConfig.push({
            name: name as PerformanceIndicatorName,
            id: +item.id,
            title: name.toUpperCase(),
            description: item.indicatorCn,
          });
        }
      }
      setIndicatorsCardConfig(cardsConfig);
    }
  }, [indicators]);

  useEffect(() => {
    indicatorsCardConfig.length &&
      fetchAllIndicatorsData(dateRange[0], dateRange[1]);
  }, [indicatorsCardConfig]);

  // 日期范围变化处理
  const handleDateRangeChange: RangePickerProps["onChange"] = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
      fetchAllIndicatorsData(dates[0], dates[1]);
    }
  };

  // 获取所有指标的数据
  const fetchAllIndicatorsData = async (
    startDate: dayjs.Dayjs,
    endDate: dayjs.Dayjs,
  ) => {
    setLoading(true);
    try {
      const requests = indicatorsCardConfig.map((indicator) => {
        return getFirstScreenIndicatorChartData(indicator.name, {
          startTime: startDate.format("YYYY-MM-DD HH:mm:ss"),
          endTime: endDate.format("YYYY-MM-DD HH:mm:ss"),
          refresh: true,
          url: "*",
          indicatorId: +indicator.id,
        });
      });

      const [lcpResponse, fpResponse, fcpResponse, ttfbResponse] =
        await Promise.all(requests);

      setLcpData(lcpResponse.data);
      setFpData(fpResponse.data);
      setFcpData(fcpResponse.data);
      setTtfbData(ttfbResponse.data);
    } catch (error) {
      console.error("Failed to fetch performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    initEventAndIndicators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <Title level={2} className="mb-4 md:mb-0 text-gray-800">
          首屏性能指标分析
        </Title>

        <div className="w-full md:w-auto">
          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            onChange={handleDateRangeChange}
            value={dateRange}
            className="w-full md:w-auto"
            placeholder={["开始时间", "结束时间"]}
          />
        </div>
      </div>

      <Spin spinning={loading} tip="加载数据中...">
        <div className="space-y-6">
          {indicatorsCardConfig.length && (
            <>
              {/* LCP Section */}
              <FirstIndicatorChartSection
                title={indicatorsCardConfig[0].title}
                chartData={lcpData}
                description={indicatorsCardConfig[0].description}
                color="#1890ff"
              />

              {/* FP Section */}
              <FirstIndicatorChartSection
                title={indicatorsCardConfig[1].title}
                description={indicatorsCardConfig[1].description}
                chartData={fpData}
                color="#52c41a"
              />

              {/* FCP Section */}
              <FirstIndicatorChartSection
                title={indicatorsCardConfig[2].title}
                description={indicatorsCardConfig[2].description}
                chartData={fcpData}
                color="#fa8c16"
              />

              {/* TTFB Section */}
              <FirstIndicatorChartSection
                title={indicatorsCardConfig[3].title}
                description={indicatorsCardConfig[3].description}
                chartData={ttfbData}
                color="#722ed1"
              />
            </>
          )}
        </div>
      </Spin>
    </div>
  );
};

export default FirstScreenDashboard;

import React, { useEffect, useState } from "react";
import { Spin, DatePicker, Input, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { GetHttpDashboardOverview } from "../../apis/overview";
import { IHttpOverview, FilterParams } from "../../apis/overview/type";
import HourlyDistributionChart from "./components/httpOverview/HourlyDistributionChart";
import RequestMethodChart from "./components/httpOverview/RequestMethodChart";
import StatisticsCards from "./components/httpOverview/StatisticsCards";
import TopInterfacesTable from "./components/httpOverview/TopInterfacesTable";
import StatusCodeChart from "./components/httpOverview/statusCodeChart";
import { IResponseCodeEnum } from "../../types/request";

const { RangePicker } = DatePicker;

const HttpDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [overviewData, setOverviewData] = useState<IHttpOverview | null>(null);
  const [filterParams, setFilterParams] = useState<FilterParams>({
    startTime: dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
    endTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    url: "*",
    interfaceUrl: "*",
  });

  // 获取总览数据
  const fetchOverviewData = async (refresh = false) => {
    setLoading(true);
    try {
      const { data, code } = await GetHttpDashboardOverview({
        ...filterParams,
        refresh,
      });
      if (data && code && code === IResponseCodeEnum.SUCCESS) {
        setOverviewData(data);
      }
    } catch (error) {
      console.error("Failed to fetch HTTP overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchOverviewData();
  }, []);

  // 处理筛选条件变更
  const handleFilterChange = (values: Partial<FilterParams>) => {
    setFilterParams((prev) => ({ ...prev, ...values }));
  };

  // 处理日期范围变更
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      handleFilterChange({
        startTime: dates[0].format("YYYY-MM-DD HH:mm:ss"),
        endTime: dates[1].format("YYYY-MM-DD HH:mm:ss"),
      });
    }
  };

  // 应用筛选并重新加载数据
  const handleApplyFilter = () => {
    fetchOverviewData();
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchOverviewData(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            HTTP 请求监控总览
          </h1>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            className="bg-blue-500"
          >
            刷新数据
          </Button>
        </div>

        {/* 筛选器 */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center">
            <span className="mr-2 text-gray-600">时间范围:</span>
            <RangePicker
              showTime
              value={[
                dayjs(filterParams.startTime),
                dayjs(filterParams.endTime),
              ]}
              onChange={handleDateRangeChange}
              className="w-64"
            />
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-gray-600">页面URL:</span>
            <Input
              disabled
              placeholder="输入页面URL或*查询全部"
              value={filterParams.url}
              onChange={(e) => handleFilterChange({ url: e.target.value })}
              className="w-64"
            />
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-gray-600">接口URL:</span>
            <Input
              disabled
              placeholder="输入接口URL或*查询全部"
              value={filterParams.interfaceUrl}
              onChange={(e) =>
                handleFilterChange({ interfaceUrl: e.target.value })
              }
              className="w-64"
            />
          </div>
          <Button
            type="primary"
            onClick={handleApplyFilter}
            className="bg-blue-500"
          >
            筛选
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : overviewData ? (
        <>
          <StatisticsCards data={overviewData} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <RequestMethodChart data={overviewData.methodDistribution} />
            <StatusCodeChart data={overviewData.statusCodeDistribution} />
            <HourlyDistributionChart data={overviewData.hourlyDistribution} />
            <TopInterfacesTable data={overviewData.interfaceUsage} />
          </div>
        </>
      ) : (
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">暂无数据</p>
        </div>
      )}
    </div>
  );
};

export default HttpDashboard;

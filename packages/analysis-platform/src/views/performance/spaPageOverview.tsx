import React, { useState, useEffect } from "react";
import {
  Card,
  Select,
  DatePicker,
  Button,
  Spin,
  Empty,
  Table,
  Tooltip,
  Typography,
  Col,
  Row,
} from "antd";
import { DualAxes, DualAxesConfig } from "@ant-design/charts";
import dayjs from "dayjs";
import { QuestionCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { GetAllPageUrls, GetSpaDashboardOverview } from "../../apis/overview";
import { IBaseAnalysisDataSearchQuery } from "../../apis/chart/types";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

interface IPerformanceIndicatorChartData {
  indicatorId: number;
  indicatorCn: string;
  url: string;
  timePoints: string[];
  p75: number[];
  p90: number[];
  values: number[]; // 平均值
  median: number[]; // 中位数
  count: number[]; // 样本数量
}

function transformChartData(chartData: IPerformanceIndicatorChartData) {
  if (!chartData) return [];

  return chartData.timePoints.map((time, index) => ({
    timePoint: time,
    ["平均加载时间"]: chartData.values[index] || 0,
    ["75%分位值"]: chartData.p75[index] || 0,
    ["样本数量"]: chartData.count[index] || 0,
  }));
}

function getDualAxesOptions(data: any[]): DualAxesConfig {
  return {
    data,
    xField: "timePoint",
    legend: true,
    slider: {
      start: 0,
      end: 1,
    },
    children: [
      {
        type: "line",
        yField: "平均加载时间",
        shapeField: "smooth",
        style: { lineWidth: 2 },
        colorField: "type",
        axis: { y: { position: "right" } },
      },
      {
        type: "interval",
        yField: "样本数量",
        colorField: "type",
        label: { position: "inside" },
        style: { maxWidth: 80 },
      },
    ],
  };
}

// 列定义
const columns = [
  {
    title: "时间点",
    dataIndex: "timePoint",
    key: "timePoint",
  },
  {
    title: "平均加载时间",
    dataIndex: "avgLoadTime",
    key: "avgLoadTime",
    sorter: (a: any, b: any) => {
      const aVal = a.avgLoadTime !== "-" ? parseInt(a.avgLoadTime) : 0;
      const bVal = b.avgLoadTime !== "-" ? parseInt(b.avgLoadTime) : 0;
      return aVal - bVal;
    },
  },
  {
    title: "75%分位值",
    dataIndex: "p75LoadTime",
    key: "p75LoadTime",
    sorter: (a: any, b: any) => {
      const aVal = a.p75LoadTime !== "-" ? parseInt(a.p75LoadTime) : 0;
      const bVal = b.p75LoadTime !== "-" ? parseInt(b.p75LoadTime) : 0;
      return aVal - bVal;
    },
  },
  {
    title: "样本数量",
    dataIndex: "sampleCount",
    key: "sampleCount",
    sorter: (a: any, b: any) => a.sampleCount - b.sampleCount,
  },
];

const SpaPageOverview: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState<boolean>(false);
  const [urlList, setUrlList] = useState<string[]>(["*"]); // 假设初始有一个通配符选项
  const [chartData, setChartData] =
    useState<IPerformanceIndicatorChartData | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string>("*");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf("day"),
    dayjs(),
  ]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [chartConfig, setChartConfig] = useState<DualAxesConfig>({});

  // 获取数据的函数
  const fetchData = async () => {
    setLoading(true);
    try {
      const query: IBaseAnalysisDataSearchQuery = {
        startTime: dateRange[0].format("YYYY-MM-DD HH:mm:ss"),
        endTime: dateRange[1].format("YYYY-MM-DD HH:mm:ss"),
        refresh: true,
        url: selectedUrl,
      };

      const { data } = await GetSpaDashboardOverview(query);
      setChartData(data);

      const renderedData = transformChartData(data);
      const chartConfig = getDualAxesOptions(renderedData);
      setChartConfig(chartConfig);

      // 处理表格数据
      if (data && data.timePoints.length > 0) {
        const tableRows = data.timePoints.map(
          (time: string, index: number) => ({
            key: index,
            timePoint: time,
            avgLoadTime:
              data.values[index] !== null ? `${data.values[index]}ms` : "-",
            p75LoadTime:
              data.p75[index] !== null ? `${data.p75[index]}ms` : "-",
            sampleCount: data.count[index] || 0,
          }),
        );
        setTableData(tableRows);
      } else {
        setTableData([]);
      }
    } catch (error) {
      console.error("获取SPA加载时间数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和URL列表获取
  useEffect(() => {
    GetAllPageUrls().then(({ data }) => {
      const urls = data.list.map(({ url }) => url);
      setUrlList(urls);
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedUrl]);

  useEffect(() => {}, []);

  return (
    <div className="p-4">
      <Title level={2}>SPA页面加载性能监控</Title>
      <Text type="secondary" className="mb-6 block">
        展示各页面加载时间数据，帮助分析和优化页面性能
      </Text>

      <Card className="mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <Text strong>页面URL: </Text>
            <Select
              style={{ width: 300 }}
              value={selectedUrl}
              onChange={(value) => setSelectedUrl(value)}
              placeholder="选择页面URL"
              className="ml-2"
            >
              {urlList.map((url) => (
                <Option key={url} value={url}>
                  {url === "*" ? "所有页面" : url}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Text strong>时间范围：</Text>
            <RangePicker
              className="ml-2"
              value={dateRange}
              onChange={(dates) => {
                if (dates) {
                  setDateRange([
                    dates[0] as dayjs.Dayjs,
                    dates[1] as dayjs.Dayjs,
                  ]);
                }
              }}
              showTime
            />
          </div>

          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchData}
            loading={loading}
          >
            刷新数据
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : chartData && chartData.timePoints.length > 0 ? (
        <>
          <Row gutter={16} className="mb-6">
            <Col span={8}>
              <Card className="shadow-sm text-center">
                <Statistic
                  title={
                    <span>
                      平均加载时间
                      <Tooltip title="所选时间范围内所有数据点的平均加载时间">
                        <QuestionCircleOutlined className="ml-1" />
                      </Tooltip>
                    </span>
                  }
                  value={getAverageValue(chartData.values)}
                  suffix="ms"
                  precision={0}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="shadow-sm text-center">
                <Statistic
                  title={
                    <span>
                      最大75%分位值
                      <Tooltip title="所选时间范围内最高的75%分位数值">
                        <QuestionCircleOutlined className="ml-1" />
                      </Tooltip>
                    </span>
                  }
                  value={getMaxValue(chartData.p75)}
                  suffix="ms"
                  precision={0}
                  valueStyle={{ color: "#f5222d" }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="shadow-sm text-center">
                <Statistic
                  title={
                    <span>
                      总样本数
                      <Tooltip title="所选时间范围内的总数据采样数量">
                        <QuestionCircleOutlined className="ml-1" />
                      </Tooltip>
                    </span>
                  }
                  value={getTotalSamples(chartData.count)}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="加载时间趋势" className="mb-6 shadow-sm">
            <Text type="secondary" className="mb-4 block">
              柱状图展示样本数量，折线图展示平均加载时间（毫秒）
            </Text>
            <DualAxes {...chartConfig} />
          </Card>

          <Card title="详细数据" className="shadow-sm">
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={{ pageSize: 10 }}
              rowKey="key"
              scroll={{ x: "max-content" }}
            />
          </Card>
        </>
      ) : (
        <Card className="shadow-sm">
          <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Card>
      )}
    </div>
  );
};

// 统计辅助函数
const Statistic = ({ title, value, suffix, precision, valueStyle }: any) => {
  return (
    <div>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-2" style={valueStyle}>
        {value !== undefined && value !== null ? value.toFixed(precision) : "-"}
        {suffix}
      </div>
    </div>
  );
};

const getAverageValue = (values: number[]) => {
  const filteredValues = values.filter((v) => v !== null);
  if (filteredValues.length === 0) return 0;
  return Math.round(
    filteredValues.reduce((acc, val) => acc + val, 0) / filteredValues.length,
  );
};

const getMaxValue = (values: number[]) => {
  const filteredValues = values.filter((v) => v !== null);
  if (filteredValues.length === 0) return 0;
  return Math.max(...filteredValues);
};

const getTotalSamples = (counts: number[]) => {
  return counts.reduce((acc, val) => acc + val, 0);
};

export default SpaPageOverview;

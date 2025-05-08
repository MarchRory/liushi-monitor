import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Statistic,
  Table,
  Badge,
  Button,
  Spin,
  Empty,
  Tooltip,
  Space,
} from "antd";
import { Line, LineConfig, Options, Pie, PieConfig } from "@ant-design/charts";
import { ReloadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import useEventAndIndicatorsStore from "../../store/eventTypeAndIndicators";
import { SelectProps } from "antd";
import { GetErrorOverView } from "../../apis/overview";
import { IErrorOverviewDataSearchQuery } from "../../apis/chart/types";
import { IErrorOverviewData } from "../../apis/overview/type";
import {
  getErrorTrendConfig,
  getErrorTypeConfig,
  getErrorUrlConfig,
} from "./configs/chart";

const { RangePicker } = DatePicker;

const ErrorOverview: React.FC = () => {
  // 使用全局状态
  const { initEventAndIndicators } = useEventAndIndicatorsStore((state) => ({
    initEventAndIndicators: state.init,
  }));

  // 状态定义
  const [errorSelections, setErrorSelections] = useState<
    SelectProps["options"]
  >([]);
  const [selectedErrorType, setSelectedErrorType] = useState<number | null>(
    null,
  );
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, "day"),
    dayjs(),
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [overviewData, setOverviewData] = useState<IErrorOverviewData | null>(
    null,
  );

  const [errorTrendConfig, setErrorTrendConfig] = useState<LineConfig>({});
  const [errorTypeConfig, setErrorTypeConfig] = useState<PieConfig>(
    {} as PieConfig,
  );
  const [errorUrlConfig, setErrorUrlsConfig] = useState<PieConfig>(
    {} as PieConfig,
  );
  // 初始化错误类型选择器数据
  useEffect(() => {
    initEventAndIndicators().then(({ eventTypesList, indicatorList }) => {
      const errorEvent = eventTypesList.find(
        (item) => item.eventTypeName === "error",
      );
      if (errorEvent) {
        const errorEventId = +errorEvent.id;
        const selectOptions: SelectProps["options"] = [
          { value: "*", label: "全部" },
        ];
        indicatorList.forEach((item) => {
          if (item.eventTypeId == errorEventId) {
            selectOptions.push({
              label: item.indicatorCn,
              value: item.id,
            });
          }
        });
        setErrorSelections(selectOptions);
        if (selectOptions.length > 0) {
          setSelectedErrorType(selectOptions[0].value as number);
        }
      }
    });
  }, []);

  // 加载错误总览数据
  const loadErrorOverviewData = async (refresh: boolean = false) => {
    if (!selectedErrorType) return;

    setLoading(true);
    try {
      const query: IErrorOverviewDataSearchQuery = {
        startTime: dateRange[0].format("YYYY-MM-DD HH:mm:ss"),
        endTime: dateRange[1].format("YYYY-MM-DD HH:mm:ss"),
        refresh,
        errorTypeId: selectedErrorType,
      };

      const { data } = await GetErrorOverView(query);
      setOverviewData(data);
      const { errorsByTime, errorsByType, errorsByUrl } = data;
      const trendConfig = getErrorTrendConfig(errorsByTime);
      const typeConfig = getErrorTypeConfig(errorsByType);
      const urlsConfig = getErrorUrlConfig(errorsByUrl);
      setErrorTrendConfig(trendConfig);
      setErrorTypeConfig(typeConfig);
      setErrorUrlsConfig(urlsConfig);
    } catch (error) {
      console.error("加载错误总览数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 监听筛选条件变化，加载数据
  useEffect(() => {
    if (selectedErrorType) {
      loadErrorOverviewData();
    }
  }, [selectedErrorType, dateRange]);

  // 错误列表列定义
  const columns = [
    {
      title: "错误ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "报错类型",
      dataIndex: "srcName",
      key: "srcName",
      Width: 100,
      render: (text: string) => <Badge status="error" text={text} />,
    },
    {
      title: "报错页面",
      dataIndex: "url",
      key: "url",
      width: 100,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "报错信息",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "最近发生时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "发生次数",
      dataIndex: "count",
      key: "count",
      width: 100,
    },
    // {
    //   title: "状态",
    //   dataIndex: "isFixed",
    //   key: "isFixed",
    //   width: 100,
    //   render: (isFixed: boolean) =>
    //     isFixed ? (
    //       <Badge status="success" text="已修复" />
    //     ) : (
    //       <Badge status="processing" text="未修复" />
    //     ),
    // },
    // {
    //   title: "操作",
    //   key: "action",
    //   width: 100,
    //   render: (_: any, record) => (
    //     <Button
    //       type="link"
    //       size="small"
    //       onClick={() => console.log("查看详情", record.id)}
    //     >
    //       详情
    //     </Button>
    //   ),
    // },
  ];

  return (
    <div className="error-overview-container">
      <Card
        title="错误监控总览"
        extra={
          <Space>
            <RangePicker
              showTime
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates)}
              style={{ width: 400 }}
            />
            <Select
              placeholder="选择错误类型"
              options={errorSelections}
              value={selectedErrorType}
              onChange={setSelectedErrorType}
              style={{ width: 200 }}
            />
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={() => loadErrorOverviewData(true)}
            >
              刷新
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          {!overviewData ? (
            <Empty description="暂无数据" />
          ) : (
            <>
              {/* 统计卡片 */}
              <Row gutter={16} className="mb-6">
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="总报错数"
                      value={overviewData.totalErrors}
                      valueStyle={{ color: "#cf1322" }}
                      prefix={<ExclamationCircleOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              {/* 图表区域 */}
              <Row gutter={16} className="mb-6">
                <Col span={24}>
                  <Card title="报错触发趋势">
                    {overviewData.errorsByTime.length > 0 ? (
                      <Line {...errorTrendConfig} height={250} />
                    ) : (
                      <Empty description="暂无趋势数据" />
                    )}
                  </Card>
                </Col>
              </Row>

              <Row gutter={16} className="mb-6">
                <Col span={12}>
                  <Card title="报错类型分布">
                    {overviewData.errorsByType.length > 0 ? (
                      <Pie {...errorTypeConfig} height={250} />
                    ) : (
                      <Empty description="暂无类型分布数据" />
                    )}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="报错页面分布">
                    {overviewData.errorsByUrl.length > 0 ? (
                      <Pie {...errorUrlConfig} height={250} />
                    ) : (
                      <Empty description="暂无URL分布数据" />
                    )}
                  </Card>
                </Col>
              </Row>

              {/* 错误列表 */}
              <Card title="近期报错">
                <Table
                  columns={columns}
                  dataSource={overviewData.topErrors}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                />
              </Card>
            </>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default ErrorOverview;

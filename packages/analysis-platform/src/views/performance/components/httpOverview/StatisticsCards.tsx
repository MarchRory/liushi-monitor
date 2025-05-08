import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic } from "antd";
import {
  ApiOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { IHttpOverview } from "../../../../apis/overview/type";

interface StatisticsCardsProps {
  data: Pick<
    IHttpOverview,
    | "todayRequests"
    | "avgResponseTime"
    | "errorRate"
    | "slowRequests"
    | "successRate"
  >;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ data }) => {
  const [statistic, setStatistic] = useState<StatisticsCardsProps["data"]>({
    todayRequests: 0,
    avgResponseTime: 0,
    errorRate: 0,
    slowRequests: { count: 0, percentage: 0 },
    successRate: 0,
  });
  useEffect(() => {
    const {
      todayRequests,
      avgResponseTime,
      errorRate,
      slowRequests,
      successRate,
    } = data;
    setStatistic({
      todayRequests,
      avgResponseTime,
      errorRate,
      slowRequests,
      successRate,
    });
  }, [data]);

  return (
    <div className="mb-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="今日请求总量"
              value={statistic.todayRequests}
              prefix={<ApiOutlined />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="平均响应时间"
              value={statistic.avgResponseTime}
              precision={2}
              suffix="ms"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
            <div className="mt-2 text-gray-500 text-sm">
              慢请求比例: {statistic.slowRequests.percentage}%
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="请求成功率"
              value={statistic.successRate}
              precision={2}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            <div className="mt-2 flex items-center">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              <span className="text-gray-500 text-sm">健康状态良好</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="请求错误率"
              value={statistic.errorRate}
              precision={2}
              suffix="%"
              prefix={<CloseCircleOutlined />}
              valueStyle={{
                color: statistic.errorRate > 5 ? "#ff4d4f" : "#faad14",
              }}
            />
            <div className="mt-2 flex items-center">
              {statistic.errorRate > 5 ? (
                <>
                  <WarningOutlined className="text-red-500 mr-1" />
                  <span className="text-red-500 text-sm">错误率偏高</span>
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                  <span className="text-gray-500 text-sm">正常范围内</span>
                </>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsCards;

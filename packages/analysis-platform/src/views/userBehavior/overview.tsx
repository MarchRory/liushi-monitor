import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  DatePicker,
  Space,
  Card,
  Select,
  Typography,
  Button,
} from "antd";
import dayjs from "dayjs";
import {
  EyeOutlined,
  InteractionOutlined,
  ExpandOutlined,
  UserOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import requestInstance from "../../utils/request";
import StatisticCard from "./components/StatisticCard";
import TrendChart from "./components/TrendChart";
import { GetMeaningfulUserBehaviorUrlsOptions } from "../../apis/heatMap";
import { IResponseCodeEnum } from "../../types/request";

const { RangePicker } = DatePicker;
const { Text } = Typography;
const { Option } = Select;

const UserBehaviorOverview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [urlsOptions, setUrlsOptiosn] = useState<string[]>([]);
  const [checkedUrl, setCheckedUrl] = useState<string>("");
  const [overviewData, setOverviewData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState([
    dayjs().subtract(1, "day"),
    dayjs(),
  ]);

  useEffect(() => {
    GetMeaningfulUserBehaviorUrlsOptions().then(({ code, data }) => {
      if (code === IResponseCodeEnum.SUCCESS) {
        const { list } = data;
        setUrlsOptiosn(list);
        list[0] && setCheckedUrl(list[0]);
      }
    });
  }, []);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const { data } = await requestInstance.get(
        "analysis/userbehavior/overview",
        {
          startTime: timeRange[0].format(),
          endTime: timeRange[1].format(),
          url: checkedUrl,
          refresh: false,
        },
      );
      setOverviewData(data);
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checkedUrl) {
      fetchOverviewData();
    }
  }, [timeRange, checkedUrl]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold m-0">用户行为分析</h1>
          <div className="flex flex-wrap gap-4 items-center">
            <Space>
              <Text strong>时间段: </Text>
              <RangePicker
                showTime
                value={timeRange}
                onChange={(dates) => dates && setTimeRange(dates)}
                className="w-96"
              />
            </Space>
            <Space>
              <Text strong>选择页面: </Text>
              <Select
                style={{ width: 300 }}
                value={checkedUrl}
                onChange={(value) => setCheckedUrl(value)}
                placeholder="选择页面URL"
                className="ml-2"
              >
                {urlsOptions.map((url) => (
                  <Option key={url} value={url}>
                    {url === "*" ? "所有页面" : url}
                  </Option>
                ))}
              </Select>
            </Space>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchOverviewData}
              loading={loading}
            >
              刷新数据
            </Button>
          </div>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            title="页面访问量(PV)"
            value={overviewData?.overview?.views?.pv || 0}
            loading={loading}
            prefix={<EyeOutlined className="text-blue-500" />}
            previousValue={overviewData?.overview?.views?.previousPv}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            title="独立访客数(UV)"
            value={overviewData?.overview?.views?.uv || 0}
            loading={loading}
            prefix={<UserOutlined className="text-green-500" />}
            previousValue={overviewData?.overview?.views?.previousUv}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            title="交互次数"
            value={overviewData?.overview?.interaction?.total || 0}
            loading={loading}
            prefix={<InteractionOutlined className="text-purple-500" />}
            previousValue={overviewData?.overview?.interaction?.previousTotal}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            title="平均曝光时长(秒)"
            value={+overviewData?.overview?.exposure?.avgValue.toFixed()}
            loading={loading}
            prefix={<ExpandOutlined className="text-orange-500" />}
            previousValue={
              +overviewData?.overview?.exposure?.previousAvgValue.toFixed()
            }
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col span={24}>
          <TrendChart data={overviewData?.trends || []} loading={loading} />
        </Col>
      </Row>
    </div>
  );
};

export default UserBehaviorOverview;

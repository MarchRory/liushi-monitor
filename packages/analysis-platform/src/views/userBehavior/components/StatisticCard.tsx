import React from "react";
import { Card, Statistic } from "antd";
import { StatisticProps } from "antd/lib/statistic/Statistic";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

interface StatisticCardProps extends Partial<StatisticProps> {
  title: string;
  value: number;
  previousValue?: number;
  loading?: boolean;
  prefix?: React.ReactNode;
  formatter?: StatisticProps["formatter"];
}

const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  previousValue,
  loading,
  prefix,
  formatter,
  ...rest
}) => {
  const getPercentageChange = () => {
    if (!previousValue) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isIncrease: change > 0,
    };
  };

  const percentageChange = getPercentageChange();

  return (
    <Card
      loading={loading}
      className="h-full shadow-sm hover:shadow-md transition-shadow"
    >
      <Statistic
        title={
          <div className="flex items-center gap-2">
            {prefix}
            <span>{title}</span>
          </div>
        }
        value={value}
        {...rest}
        suffix={
          percentageChange && (
            <span
              className={`text-sm ${
                percentageChange.isIncrease ? "text-green-500" : "text-red-500"
              }`}
            >
              {percentageChange.isIncrease ? (
                <ArrowUpOutlined />
              ) : (
                <ArrowDownOutlined />
              )}
              {percentageChange.value}%
            </span>
          )
        }
        formatter={formatter}
      />
    </Card>
  );
};

export default StatisticCard;

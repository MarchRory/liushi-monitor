import React, { useEffect, useState } from "react";
import { Card, Tabs, Empty } from "antd";
import { Funnel, FunnelConfig, Sankey, SankeyConfig } from "@ant-design/charts";
import { FunnelAnalysisData } from "../../../apis/overview/type";
import { getFunnelCfg, getSankeyCfg } from "../configs/chart";

interface FunnelAnalysisChartProps {
  data: FunnelAnalysisData;
  loading?: boolean;
}

const FunnelAnalysisChart: React.FC<FunnelAnalysisChartProps> = ({
  data,
  loading,
}) => {
  const [funnelCfg, setFunnelCfg] = useState<FunnelConfig>({});
  const [sankeyCfg, setSankeyCfg] = useState<SankeyConfig>({});
  const [hasPathData, setHasPathData] = useState(false);
  const hasFunnelData = data?.funnelSteps && data.funnelSteps.length > 0;
  useEffect(() => {
    const newFunnelCfg = getFunnelCfg(data.funnelSteps);
    const HasPathData = data.pathTransitions && data.pathTransitions.length > 0;
    setHasPathData(HasPathData);
    const newSankeyCfg = getSankeyCfg(data.pathTransitions, HasPathData);
    setFunnelCfg(newFunnelCfg);
    setSankeyCfg(newSankeyCfg);
  }, [data]);

  return (
    <Card loading={loading} className="shadow-sm">
      <div className="text-lg font-medium mb-4">转化分析</div>
      <Tabs
        items={[
          {
            key: "funnel",
            label: "浏览漏斗分析",
            children: hasFunnelData ? (
              <Funnel {...funnelCfg} />
            ) : (
              <Empty description="暂无漏斗数据" />
            ),
          },
          //   {
          //     key: "sankey",
          //     label: "路径流转桑基图",
          //     children: hasPathData ? (
          //       <Sankey {...sankeyCfg} />
          //     ) : (
          //       <Empty description="暂无路径流转数据" />
          //     ),
          //   },
        ]}
      />
    </Card>
  );
};

export default FunnelAnalysisChart;

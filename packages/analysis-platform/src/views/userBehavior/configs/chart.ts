import { FunnelConfig, SankeyConfig } from "@ant-design/charts";
import { FunnelAnalysisData } from "../../../apis/overview/type";

export function getFunnelCfg(data: FunnelAnalysisData['funnelSteps'] = []): FunnelConfig {
    return {
        data: data || [],
        xField: "step",
        yField: "count",
        label: {
            text: (d: {
                step: string;
                count: number;
            }) => `${d.step}\n人次: ${d.count}`,
        },
    }
}

export function getSankeyCfg(data: FunnelAnalysisData['pathTransitions'] = [], hasPathData: boolean): SankeyConfig {

    if (!hasPathData) return { nodes: [], links: [] };
    const sankeyData = {
        nodes: Array.from(
            new Set([
                ...(data || []).map((item) => item.from),
                ...(data || []).map((item) => item.to),
            ]),
        ).map((id) => ({ id })),
        links: (data || []).map((item) => ({
            source: item.from,
            target: item.to,
            value: item.count,
        })),
    }
    return {
        data: sankeyData.links,
        sourceField: "source",
        targetField: "target",
        weightField: "value",
        layout: {
            nodeWidth: 0.01,
            nodeSort: (a, b) => b.value - a.value,
        },
        linkColorField: (d) => d.source.key,
        style: {
            labelFontSize: 15,
            linkFillOpacity: 0.4,
            nodeStrokeWidth: 0,
        },
        tooltip: {
            items: [
                { name: "来源", field: "source" },
                { name: "去向", field: "target" },
                { name: "人次", field: "value" }
            ]
        }
    }
}
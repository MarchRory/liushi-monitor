import { LineConfig, PieConfig } from "@ant-design/charts";
import dayjs from 'dayjs'
import { IErrorOverviewData } from "../../../apis/overview/type";

export function getErrorTrendConfig(originData: IErrorOverviewData['errorsByTime']): LineConfig {
    return {
        data: originData,
        xField: "time_group",
        yField: "count",
        seriesField: "timestamp",
        smooth: true,
        legend: {
            position: "top",
        },
        xAxis: {
            type: "time",
            label: {
                formatter: (v: string) => dayjs(v).format("MM-DD HH:mm"),
            },
        },
        tooltip: {
            items: [
                { name: "数量", field: "count" }
            ]
        },
    }
}

export function getErrorTypeConfig(originData: IErrorOverviewData['errorsByType']): PieConfig {
    return {
        data: originData,
        appendPadding: 10,
        angleField: "count",
        colorField: "type",
        radius: 0.8,
        interactions: [
            { type: "pie-legend-active" },
            { type: "element-active" },
        ],
        tooltip: {
            title: {
                field: "type"
            },
            items: [
                { name: "数量", field: "count" }
            ]
        }
    }
}

export function getErrorUrlConfig(originData: IErrorOverviewData['errorsByUrl']): PieConfig {
    return {
        data: originData.map((item) => ({
            type:
                item.url.length > 25 ? item.url.substring(0, 25) + "..." : item.url,
            value: +item.count,
            url: item.url,
        })),
        appendPadding: 10,
        angleField: "value",
        colorField: "type",
        radius: 0.8,
        interactions: [
            { type: "pie-legend-active" },
            { type: "element-active" },
        ],
        tooltip: {
            title: {
                field: "url"
            },
            items: [
                { name: "数量", field: "value" }
            ]
        },
    }
}
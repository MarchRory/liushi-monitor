import { ECOption } from "..";

export function getBaseLineOptions(xAxisData: string[], seriesDatas: (number | null)[][], otherOptions: ECOption = {}) {
    const options: ECOption = {
        xAxis: {
            name: '当日时间段',
            type: 'category',
            boundaryGap: false,
            data: xAxisData,
        },
        yAxis: {
            name: "单位: ms",
            type: 'value'
        },
        tooltip: {
            trigger: 'axis'
        },
        series: seriesDatas.map((data) => ({
            data,
            type: 'line',

        }))
    }
    Object.assign(options, otherOptions)
    return options
}
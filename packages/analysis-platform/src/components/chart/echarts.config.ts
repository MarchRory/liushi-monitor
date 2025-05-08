import * as echarts from 'echarts/core';
import { DataZoomComponent } from 'echarts/components';
import {
    BarChart,
    LineChart
} from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    // 数据集组件
    DatasetComponent,
    // 内置数据转换器组件 (filter, sort)
    TransformComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import type {
    // 系列类型的定义后缀都为 SeriesOption
    BarSeriesOption,
    LineSeriesOption
} from 'echarts/charts';
import type {
    // 组件类型的定义后缀都为 ComponentOption
    TitleComponentOption,
    TooltipComponentOption,
    GridComponentOption,
    DatasetComponentOption
} from 'echarts/components';
import type {
    ComposeOption,
} from 'echarts/core';

// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
export type ECOption = ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | TitleComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | DatasetComponentOption
>;

export type ECharts = echarts.ECharts

export interface ICommonChartProps {
    option: ECOption;
    loading?: boolean;
    theme?: string;
    notMerge?: boolean;
    lazyUpdate?: boolean;
    showRefreshButton?: boolean;
    refreshButtonPosition?: "topRight" | "topLeft";
    enableDataZoom?: boolean;
    debounceTime?: number;
    onChartReady?: (instance: ECharts) => void;
    onEvents?: Record<string, Function>;
    style?: React.CSSProperties;
    className?: string;
}

// 注册必须的组件
echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    BarChart,
    LineChart,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer,
    DataZoomComponent
]);

export const echartsCore = echarts
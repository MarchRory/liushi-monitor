/**
 * @description 进度条上每个节点的配置
 */
export interface BaseProgressNode {
  thresholdStep: number; // 节点被激活时对应的最小进度值
  tip: string; // 每个节点的脚注s
  icon?: string; // 节点图标, 默认使用tabler图标集
  src?: string; // 节点图片资源路径, 和图标任选其一
  trigger?: (...args: any[]) => void; // 点击节点触发的方法
}

/**
 * @description 基础进度条的props
 */
export interface BaseProgressBarProps {
  currentStep: number; // 当前进度值
  totalSteps: number; // 进度条100%时对应的实际数值
  nodes: BaseProgressNode[]; // 进度条上每个节点的配置对象数组
  trackColor?: string; // 进度条轨道的颜色
  barColor?: string; // 进度条激活部分的颜色
}

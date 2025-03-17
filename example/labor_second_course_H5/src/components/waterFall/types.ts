import { ListResponseModel, TombstoneGeneratedFields, pageParams } from '@/api/types/public'
import { Response } from '@/utils/http/types'
import { CSSProperties } from 'vue'

/**
 * @description 瀑布流中每个卡片的原始数据
 */
export interface WaterFallCard extends TombstoneGeneratedFields {
    [key: string]: any
    /**
     * @description 封面是必要的, 且应该包含图片的宽高信息, 但是在分页请求里拿到的是一段json, 需要自己手动对其转化
     */
    cover: {
        url: string
        width: number
        height: number
    }
}

/**
 * @description 瀑布流列表组件传入的属性
 */
export interface WaterFallListProps {
    /**
     * @description 列表请求API
     * @param args 
     * @returns 
     */
    requestApi: (...args: any[]) => Promise<Response<ListResponseModel<WaterFallCard>>>
    /**
     * @description 瀑布流列数
     */
    column?: number
    /**
     * @description 每列之间的间隔
     */
    gap?: number
    /**
     * @description 单次请求的最大数据量
     */
    pageSize?: number
    /**
     * @description 基本分页参数外的其他请求参数
     */
    otherRequestParams?: Omit<Record<string, any>, keyof pageParams>
}

/**
 * @description 虚拟瀑布流滚动状态
 */
export interface WaterfallScrollState {
    viewWidth?: number,
    viewHeight?: number,
    start?: number
}

/**
 * @description 渲染卡片内容
 */
export interface WaterfallRenderItem {
    /**
     * @description 渲染数据源
     */
    item: WaterFallCard
    /**
     * @description 渲染卡片距离虚拟列表顶部的距离
     */
    _y: number
    /**
     * @description 渲染卡片自身高度
     */
    _height: number
    /**
     * @description JS控制的渲染卡片样式内容
     */
    style: CSSProperties
}

/**
 * @description 瀑布流每一列
 */
export interface WaterfallColumnQueue {
    /**
     * @description 视口中被渲染出的列表
     */
    list: WaterfallRenderItem[]
    /**
     * @description 视口中渲染出的列表高度
     */
    height: number
}

export interface WaterfallCardRect {
    width: number
    height: number
}
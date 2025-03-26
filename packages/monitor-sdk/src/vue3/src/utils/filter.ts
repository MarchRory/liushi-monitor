import { IOriginalData } from "monitor-sdk/src/types";
import { getCurrentTimeStamp } from "monitor-sdk/src/utils/time";
import { getCurrentUrl } from "monitor-sdk/src/utils/url";
import type { ComponentPublicInstance } from "vue";

/**
 * 从报错信息中过滤出上报信息
 * @param err Vue报错messgae和代码堆栈
 * @param instance 报错组件实例
 * @param info 
 * @returns 
 */
export function filterVmCollectedInfo(err: unknown, instance: ComponentPublicInstance | null, info: string): IOriginalData {
    /**
     * TODO: props理论上不需要全部记录, 组件复杂时可能会导致props规模过大
     *       未来应当选择兼顾数据规模和现场还原能力的数据进行上报
     */

    const errorComponentData = {
        eventName: 'vue3_framework_error',
        timestamp: getCurrentTimeStamp(),
        url: getCurrentUrl(),
        componentName: instance?.$options.name || "未设置组件名",
        parentComponentName: instance?.$parent?.$options.name || '父组件未设置组件名',
        props: { ...instance?.$props }
    }

    return {
        err,
        info,
        errorComponentData
    }
}
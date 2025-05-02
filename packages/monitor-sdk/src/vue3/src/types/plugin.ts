import { IPluginTransportDataBaseInfo } from "monitor-sdk/src/types";

export type Vue3ErrorTrapTransportData = IPluginTransportDataBaseInfo<'vue3_framework_error', {
    stack: string
    srcName: string,
    info: string
    errorComponentData: {
        componentName: string
        parentComponentName: string
        props: object
    }
}>
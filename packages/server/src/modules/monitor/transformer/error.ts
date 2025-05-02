import {
    ErrorEventTypes,
    IBaseTransformedData,
    JsSyncErrorData,
    SourceErrorData,
    TransformedErrorData,
    UnCatchPromiseErrorData,
    Vue3ErrorTrapData
} from "../types";

function jsErrorTransformer(
    origin: JsSyncErrorData
) {
    const { syncError } = origin
    const res: TransformedErrorData[] = []
    for (const errorItem of syncError) {
        res.push({
            srcName: typeof errorItem.errorEvent === 'string' ? errorItem.errorEvent : '',
            description: errorItem.stackDetail?.message || "",
            codeLocation: JSON.stringify({
                column: errorItem.codeColumn,
                line: errorItem.codeLine
            }),
            props: '',
            stack: JSON.stringify(errorItem.stackDetail || { message: "", stack: "" })
        })
    }

    return res
}

function promiseErrorTransformer(
    origin: UnCatchPromiseErrorData
) {
    const { reason } = origin
    const res: TransformedErrorData = {
        description: reason.message,
        codeLocation: '',
        srcName: reason.name || "",
        props: '',
        stack: reason.stack
    }

    return [res]
}

function sourceErrorTransformer(
    origin: SourceErrorData
) {
    const res: TransformedErrorData = {
        description: "",
        codeLocation: "",
        srcName: origin.nodeName,
        stack: "",
        props: JSON.stringify(origin.attributes)
    }
    return [res]
}

function vue3ErrorTransformer(
    origin: Vue3ErrorTrapData
) {
    const { stack, srcName, info, errorComponentData } = origin
    const res: TransformedErrorData = {
        description: info,
        codeLocation: "",
        srcName: srcName,
        stack: JSON.stringify(stack || ""),
        props: JSON.stringify(errorComponentData.props)
    }
    return [res]
}

export default function (
    indicatorName: ErrorEventTypes,
    originCollectedData: IBaseTransformedData<'error'>['collectedData']['data'] | null
) {
    if (originCollectedData === null) return []

    if (indicatorName === 'javaScript_sync_error') {
        return jsErrorTransformer(originCollectedData as JsSyncErrorData)
    } else if (indicatorName === 'uncatch_promise_error') {
        return promiseErrorTransformer(originCollectedData as UnCatchPromiseErrorData)
    } else if (indicatorName === 'source_load_error') {
        return sourceErrorTransformer(originCollectedData as SourceErrorData)
    } else if (indicatorName === 'vue3_framework_error') {
        return vue3ErrorTransformer(originCollectedData as Vue3ErrorTrapData)
    } else if (indicatorName === 'post_message_to_worker_error') {
    }

    return [originCollectedData]
}
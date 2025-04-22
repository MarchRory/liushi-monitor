export type ErrorEventTypes =
    'vue3_framework_error'
    | 'javaScript_sync_error'
    | 'source_load_error'
    | 'uncatch_promise_error'
    | 'post_message_to_worker_error'

export type JsSyncErrorData = {
    syncError: {
        errorEvent?: string | Event
        sourceFile?: string
        codeLine?: number
        codeColumn?: number
        stackDetail?: {
            message?: string
            stack?: string
        },
    }[]
}

export type UnCatchPromiseErrorData = {
    reason: PromiseRejectionEvent['reason']
}

export type SourceErrorData = {
    nodeName: string
    attributes: Pick<Attr, 'name' | 'value'>[]
}

export type Vue3ErrorTrapData = {
    err: unknown
    info: string
    errorComponentData: {
        componentName: string
        parentComponentName: string
        props: object
    }
}
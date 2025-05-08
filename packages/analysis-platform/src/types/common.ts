export interface IBaseDataInfo {
    id: number
}

export interface IBaseMainDataInfo extends IBaseDataInfo {
    isDefault: boolean
}

type IDefaultIndicatorConfig = Record<0 | 1, { text: string, tagColor: string }>
export const DefaultIndicatorMap: IDefaultIndicatorConfig = {
    [1]: {
        text: 'SDK默认',
        tagColor: "purple"
    },
    [0]: {
        text: '自定义',
        tagColor: "cyan"
    }
}